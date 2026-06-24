import { prisma } from '../lib/prisma.ts';
import { hashPassword, comparePassword, generateTokens } from '../lib/auth.ts';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/[A-Z]/).regex(/[a-z]/).regex(/[0-9]/).regex(/[^A-Za-z0-9]/),
});

export const login = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

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

    res.json({
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        forcePasswordChange: user.forcePasswordChange,
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
};

export const register = async (req: any, res: any) => {
  try {
    const { email, password } = registerSchema.parse(req.body);

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

    // In a real app, send email here.
    console.log(`Verification link: /api/auth/verify?token=${verificationToken}`);

    res.json({ message: 'Registration successful. Please verify your email.' });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const logout = (req: any, res: any) => {
  res.clearCookie('accessToken');
  res.clearCookie('refreshToken');
  res.json({ message: 'Logged out' });
};
