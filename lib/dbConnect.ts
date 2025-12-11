// lib/dbConnect.ts

import { PrismaClient } from "@/app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

// Tell TypeScript that globalThis may hold a Prisma client
const globalForPrisma = globalThis as unknown as { 
  prisma?: PrismaClient;
};

// Safety check for DATABASE_URL
if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set in environment variables");
}

// Create Prisma adapter for PostgreSQL
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

// Reuse Prisma client if already created (dev hot-reload safe)
const dbConnect =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // REQUIRED when using PrismaPg
  });

// Store in global scope during development
if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = dbConnect;
}

export default dbConnect;
