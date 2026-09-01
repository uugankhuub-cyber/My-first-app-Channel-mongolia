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

// Global caching of DB health state
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

  // If already connected and healthy, return true. If failed, let's try again in case it recovered.
  if (globalForPrisma.connectionChecked && globalForPrisma.isDbHealthy) {
    return true;
  }

  try {
    // Race connection check with a 15 second timeout (Railway might be slow to connect on cold boot)
    const connectPromise = prisma.$connect();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Database connection timeout')), 15000)
    );

    await Promise.race([connectPromise, timeoutPromise]);
    
    globalForPrisma.isDbHealthy = true;
    globalForPrisma.connectionChecked = true;
    console.log('Database connection successful!');
  } catch (err: any) {
    globalForPrisma.isDbHealthy = false;
    console.warn('Database is set but unreachable. Error:', err.message);
  }

  return globalForPrisma.isDbHealthy;
}

export function getDbStatus(): boolean {
  if (!process.env.DATABASE_URL) return false;
  return globalForPrisma.isDbHealthy;
}
