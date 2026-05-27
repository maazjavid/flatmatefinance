import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../../generated/prisma/client";

/**
 * Singleton Prisma client.
 *
 * Prisma v7 requires a driver adapter — for local dev we use better-sqlite3
 * (file-based SQLite, zero external setup). For production swap to
 * `@prisma/adapter-pg` (Postgres) and change `provider` in
 * `prisma/schema.prisma` to "postgresql".
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  // SQLite URLs come in like `file:./dev.db`. The driver expects the bare path.
  const sqliteUrl = url.startsWith("file:") ? url.slice("file:".length) : url;
  const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
