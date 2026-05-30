import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import { Pool } from "pg";

/**
 * Singleton Prisma client.
 *
 * Prisma v7 requires a driver adapter:
 * - SQLite (`file:...`) for local dev
 * - PostgreSQL (`postgresql://...`) for Docker and AWS RDS
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function isSqliteUrl(url: string): boolean {
  return url.startsWith("file:");
}

function createPrismaClient() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error("DATABASE_URL is not set");
  }

  if (isSqliteUrl(url)) {
    const sqliteUrl = url.startsWith("file:") ? url.slice("file:".length) : url;
    const adapter = new PrismaBetterSqlite3({ url: sqliteUrl });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    });
  }

  const pool = new Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
