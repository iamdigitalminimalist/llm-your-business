import { PrismaClient } from './generated/prisma';

// Environment-aware Prisma client configuration
const isDevelopment = process.env.NODE_ENV !== 'production';

export const prisma = new PrismaClient({
  log: isDevelopment ? ['query', 'info', 'warn', 'error'] : ['error'],
});

// Database connection utilities
export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

// Re-export PrismaClient for type usage
export { PrismaClient };
