import { prisma, getDbStatus } from '../lib/prisma.ts';
import { hashPassword, comparePassword, generateTokens } from '../lib/auth.ts';
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

  try {
    if (isDbAvailable()) {
      try {
        const user = await prisma.user.findUnique({ where: { email } });

        if (user) {
          // Check locking
          if (user.lockedUntil && user.lockedUntil > new Date()) {
            return res.status(403).json({ error: 'Account locked. Try again later.' });
          }

          const isValid = await comparePassword(password, user.password);

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
            return res.status(401).json({ error: 'Invalid credentials' });
          }

          // Reset failed attempts
          await prisma.user.update({
            where: { id: user.id },
            data: { failedLoginAttempts: 0, lockedUntil: null },
          });

          // Check for email verification
          if (!user.emailVerified && user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Email not verified. Please check your inbox.' });
          }

          const tokens = generateTokens(user.id, user.role);

          // Set HttpOnly cookies
          res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
          res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

          return res.json({
            user: {
              id: user.id,
              email: user.email,
              role: user.role,
              forcePasswordChange: user.forcePasswordChange,
            }
          });
        }
      } catch (dbError: any) {
        console.error('Database query failed in login, falling back to mock DB:', dbError.message);
      }
    }

    // FALLBACK TO MOCK DB
    await mockDb.ensureAdmin();
    const db = mockDb.getDb();
    const user = db.users.find(u => u.email === email);

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isValid = await comparePassword(password, user.passwordHash);
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const tokens = generateTokens(user.id, user.role);

    // Set HttpOnly cookies
    res.cookie('accessToken', tokens.accessToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 15 * 60 * 1000 });
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        forcePasswordChange: false,
      }
    });

  } catch (error: any) {
    console.error('Login error:', error);
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
          },
        });

        console.log(`Verification link: /api/auth/verify?token=${verificationToken}`);
        return res.json({ message: 'Registration successful. Please verify your email.' });
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
    res.json({ message: 'Registration successful. Account pre-verified for seamless testing!' });

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
