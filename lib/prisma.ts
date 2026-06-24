import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  isDbHealthy: boolean;
  connectionChecked: boolean;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

// Global caching of DB health state to prevent re-checks
if (globalForPrisma.isDbHealthy === undefined) {
  globalForPrisma.isDbHealthy = false;
  globalForPrisma.connectionChecked = false;
}

export async function checkConnection(): Promise<boolean> {
  if (!process.env.DATABASE_URL) {
    globalForPrisma.isDbHealthy = false;
    globalForPrisma.connectionChecked = true;
    return false;
  }
  if (globalForPrisma.connectionChecked) {
    return globalForPrisma.isDbHealthy;
  }
  try {
    // Race connection check with a 2 second timeout to prevent startup hangs
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 2000)
    );
    await Promise.race([connectPromise, timeoutPromise]);
    globalForPrisma.isDbHealthy = true;
    console.log('Database connection successful!');
  } catch (err: any) {
    globalForPrisma.isDbHealthy = false;
    console.warn('Database is set but unreachable. Falling back to Mock DB. Error:', err.message);
  }
  globalForPrisma.connectionChecked = true;
  return globalForPrisma.isDbHealthy;
}

export function getDbStatus(): boolean {
  if (!process.env.DATABASE_URL) return false;
  return globalForPrisma.isDbHealthy;
}

