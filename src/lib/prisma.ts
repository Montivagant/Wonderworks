import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

// Prevent multiple instances of Prisma Client in development
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['error', 'warn'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// Prisma middleware to hash passwords automatically
prisma.$use(async (params, next) => {
  if (params.model === 'User') {
    if (['create', 'update'].includes(params.action)) {
      const password = params.args.data?.password;
      if (password && !password.startsWith('$2')) {
        params.args.data.password = await bcrypt.hash(password, 10);
      }
    }
  }
  return next(params);
}); 