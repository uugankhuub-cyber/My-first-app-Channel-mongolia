import { prisma, getDbStatus } from './prisma';
import { hashPassword } from '../api/auth-handlers';

export async function ensurePrismaAdmin() {
  if (!getDbStatus()) return;

  const adminEmail = process.env.INITIAL_ADMIN_EMAIL || 'admin@channelmongolia.mn';
  const adminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'Admin123!';

  try {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      const hashedPassword = await hashPassword(adminPassword);
      await prisma.user.create({
        data: {
          email: adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          emailVerified: true,
        }
      });
      console.log(`[PRISMA-SEED] Seeded initial admin: ${adminEmail}`);
    } else {
      if (existingAdmin.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: existingAdmin.id },
          data: { role: 'ADMIN' }
        });
        console.log(`[PRISMA-SEED] Upgraded user ${adminEmail} to ADMIN role.`);
      }
    }
  } catch (error) {
    console.error('[PRISMA-SEED] Failed to seed admin:', error);
  }
}
