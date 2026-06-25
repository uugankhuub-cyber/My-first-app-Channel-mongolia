import { prisma, getDbStatus } from '../lib/prisma.ts';
import { hashPassword, comparePassword, generateTokens, verifyAccessToken } from '../lib/auth.ts';
import { z } from 'zod';
import * as mockDb from '../lib/mock-db.ts';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

const isDbAvailable = () => {
  return getDbStatus();
};

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;
  console.log(`[AUTH-LOGIN] Login attempt initiated for email: "${email}"`);

  try {
    if (isDbAvailable()) {
      console.log('[AUTH-LOGIN] Prisma DB is connected/available. Querying Prisma.');
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          console.log(`[AUTH-LOGIN] Found user "${email}" in Prisma DB. Role: ${user.role}`);
          // Check locking
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            console.log(`[AUTH-LOGIN] User account "${email}" is locked until ${user.lockedUntil}`);
            return res.status(403).json({ error: 'Account locked. Try again later.' });
          }

          const isValid = await comparePassword(password, user.password);
          console.log(`[AUTH-LOGIN] Password comparison result in Prisma for "${email}": ${isValid}`);

          if (!isValid) {
            // Increment failed attempts
            const failedAttempts = user.failedLoginAttempts + 1;
            let lockedUntil = null;
            if (failedAttempts >= 5) {
              lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            }
            await prisma.user.update({
              where: { id: user.id },
              data: { failedLoginAttempts: failedAttempts, lockedUntil },
            });
            console.log(`[AUTH-LOGIN] Invalid credentials entered for "${email}" in Prisma DB.`);
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Reset failed attempts
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });

          // Check for email verification
          if (!user.emailVerified && user.role !== 'ADMIN') {
            console.log(`[AUTH-LOGIN] User "${email}" is not verified (non-admin).`);
            return res.status(403).json({ error: 'Email not verified. Please check your inbox.' });
          }

          const tokens = generateTokens(user.id, user.role);

          // Set HttpOnly cookies with sameSite: 'lax' for robust iframe preview and top-level navigation support
          res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
          res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

          console.log(`[AUTH-LOGIN] Login successful for "${email}" via Prisma. Role: ${user.role}`);
          return res.json({
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              forcePasswordChange: user.forcePasswordChange,
            }
          });
        } else {
          console.log(`[AUTH-LOGIN] User "${email}" not found in Prisma DB. Falling back to Mock DB.`);
        }
      } catch (dbError: any) {
        console.error('[AUTH-LOGIN] Database query failed in login, falling back to mock DB:', dbError.message);
      }
    } else {
      console.log('[AUTH-LOGIN] Prisma DB is NOT available. Using Mock DB directly.');
    }

    // FALLBACK TO MOCK DB
    await mockDb.ensureAdmin();
    const db = mockDb.getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      console.log(`[AUTH-LOGIN] User "${email}" not found in Mock DB.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log(`[AUTH-LOGIN] Found user "${email}" in Mock DB. Role: ${user.role}`);
    const isValid = await comparePassword(password, user.passwordHash);
    console.log(`[AUTH-LOGIN] Password comparison result in Mock DB for "${email}": ${isValid}`);
    
    if (!isValid) {
      console.log(`[AUTH-LOGIN] Invalid credentials entered for "${email}" in Mock DB.`);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id, user.role);

    // Set HttpOnly cookies with sameSite: 'lax' for robust iframe preview and top-level navigation support
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    console.log(`[AUTH-LOGIN] Login successful for "${email}" via Mock DB. Role: ${user.role}`);
    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        forcePasswordChange: false,
      }
    });

  } catch (error: any) {
    console.error('[AUTH-LOGIN] Unexpected login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: any, res: any) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

    if (isDbAvailable()) {
      try {
        const existing = await prisma.user.findUnique({ where: { email } });
        if (existing) return res.status(400).json({ error: 'Email already registered' });

        const hashedPassword = await hashPassword(password);
        const verificationToken = Math.random().toString(36).substring(2, 15);

        const user = await prisma.user.create({
          data: {
            email,
            password: hashedPassword,
            verificationToken,
            emailVerified: true, // Auto-verify email for seamless UX on Railway
          },
        });

        console.log(`Verification link: /api/auth/verify?token=${verificationToken}`);

        const tokens = generateTokens(user.id, user.role);

        // Set HttpOnly cookies
        res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
        res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

        return res.json({
          message: 'Registration successful. Please verify your email.',
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
          }
        });
      } catch (dbError: any) {
        console.error('Database query failed in register, falling back to mock DB:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    const db = mockDb.getDb();
    const existing = db.users.find(u => u.email === email);
    if (existing) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const hashedPassword = await hashPassword(password);
    const verificationToken = Math.random().toString(36).substring(2, 15);

    const newUser: mockDb.MockUser = {
      id: 'user-' + Math.random().toString(36).substring(2, 15),
      email,
      passwordHash: hashedPassword,
      role: 'USER',
      emailVerified: true, // Auto-verify in mock mode for better UX
      verificationToken,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.users.push(newUser);
    mockDb.saveDb(db);

    console.log(`Mock verification link: /api/auth/verify?token=${verificationToken}`);

    const tokens = generateTokens(newUser.id, newUser.role);

    // Set HttpOnly cookies
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      message: 'Registration successful. Account pre-verified for seamless testing!',
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

  if (isDbAvailable()) {
    try {
      const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
      if (user) {
        return res.json({
          user: {
            id: user.id,
            email: user.email,
            role: user.role,
            forcePasswordChange: user.forcePasswordChange,
          }
        });
      }
    } catch (e) {
      console.error('Database query failed in getMe, falling back to mock DB');
    }
  }

  const db = mockDb.getDb();
  const user = db.users.find(u => u.id === decoded.userId);
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
