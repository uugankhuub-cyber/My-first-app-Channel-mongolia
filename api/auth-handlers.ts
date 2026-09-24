import { hashPassword, comparePassword, generateTokens, verifyAccessToken } from '../lib/auth.ts';
import { z } from 'zod';
import * as db from '../lib/firestore-db.ts';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  console.log(`[AUTH-LOGIN] Login attempt initiated for email: "${email}"`);

  try {
    const user = await db.getUserByEmail(email);

    if (!user) {
      console.log(`[AUTH-LOGIN] User "${email}" not found in Firestore.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check locking
    if (user.lockedUntil && new Date(user.lockedUntil) > new Date()) {
      console.log(`[AUTH-LOGIN] User account "${email}" is locked until ${user.lockedUntil}`);
      return res.status(403).json({ error: 'Account locked. Try again later.' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    console.log(`[AUTH-LOGIN] Password comparison result for "${email}": ${isValid}`);

    if (!isValid) {
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      let lockedUntil: string | null = null;
      if (failedAttempts >= 5) {
        lockedUntil = new Date(Date.now() + 15 * 60 * 1000).toISOString();
      }
      await db.updateUser(user.id, { failedLoginAttempts: failedAttempts, lockedUntil });
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Reset failed attempts on success
    await db.updateUser(user.id, { failedLoginAttempts: 0, lockedUntil: null });

    const tokens = generateTokens(user.id, user.role);

    // Set HttpOnly cookies with sameSite: 'lax' for robust iframe preview and top-level navigation support
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    console.log(`[AUTH-LOGIN] Login successful for "${email}". Role: ${user.role}`);
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        forcePasswordChange: false,
      }
    });
  } catch (error: any) {
    console.error('[AUTH-LOGIN] Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: any, res: any) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    const existing = await db.getUserByEmail(email);
    if (existing) {
      return res.status(400).json({ error: 'User already exists' });
    }

    const hashedPassword = await hashPassword(password);
    const newUser = await db.createUser({
      email,
      passwordHash: hashedPassword,
      role: 'USER',
      emailVerified: true,
      failedLoginAttempts: 0,
      lockedUntil: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    const tokens = generateTokens(newUser.id, newUser.role);

    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      message: 'Registration successful.',
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        forcePasswordChange: false,
      }
    });
  } catch (error: any) {
    console.error('Register error:', error);
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
};

export const logout = (req: any, res: any) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};

export const getMe = async (req: any, res: any) => {
  const token = req.cookies?.accessToken || req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  const decoded = verifyAccessToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }

  const user = await db.getUserById(decoded.userId);
  if (user) {
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        forcePasswordChange: false,
      }
    });
  }

  res.status(404).json({ error: 'User not found' });
};

export const googleAdminLogin = async (req: any, res: any) => {
  const { email } = req.body;
  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const ADMIN_EMAIL = 'uugankhuub@gmail.com';

  if (normalizedEmail !== ADMIN_EMAIL.toLowerCase()) {
    return res.status(403).json({ error: `Хандах эрхгүй: ${email} хаяг админ биш байна. Зөвхөн ${ADMIN_EMAIL} зөвшөөрөгдөнө.` });
  }

  let adminUser = await db.getUserByEmail(ADMIN_EMAIL);
  if (!adminUser) {
    const { hashPassword } = await import('../lib/auth.ts');
    const dummyHash = await hashPassword('AdminPasswordGeneratedForOAuth!');
    adminUser = await db.createUser({
      email: ADMIN_EMAIL,
      passwordHash: dummyHash,
      role: 'ADMIN',
      emailVerified: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }, 'admin-1');
  } else if (adminUser.role !== 'ADMIN') {
    await db.updateUser(adminUser.id, { role: 'ADMIN' });
    adminUser.role = 'ADMIN';
  }

  const tokens = generateTokens(adminUser.id, 'ADMIN');

  res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
  res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

  return res.json({
    user: {
      id: adminUser.id,
      email: adminUser.email,
      role: adminUser.role,
      forcePasswordChange: false
    }
  });
};
