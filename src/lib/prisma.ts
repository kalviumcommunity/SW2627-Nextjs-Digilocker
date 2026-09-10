import { PrismaClient } from "@prisma/client";

/**
 * Global Prisma Client singleton
 * 
 * This ensures that we only create one instance of PrismaClient across the application.
 * In development, Next.js hot reloads can cause multiple instances to be created,
 * which is why we use a global variable to store the singleton instance.
 * 
 * @see https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/nextjs-prisma-client-monorepo
 */

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["query", "error", "warn"]
        : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
