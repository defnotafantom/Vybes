import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Create or reuse Prisma Client instance
// In serverless environments (like Vercel), we need to cache it globally
// to prevent connection pool exhaustion
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  })

// Always cache in globalThis to prevent multiple instances
// This is especially important for serverless functions
if (!globalForPrisma.prisma) {
  globalForPrisma.prisma = prisma
}

