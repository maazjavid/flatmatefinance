import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";
import fs from "node:fs";
import path from "node:path";
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

/** AWS RDS requires TLS with the Amazon RDS CA bundle (see Dockerfile runtime stage). */
function createPgPool(connectionString: string): Pool {
  const isRds = connectionString.includes("rds.amazonaws.com");
  let url = connectionString;
  try {
    const parsed = new URL(connectionString);
    parsed.searchParams.delete("sslmode");
    url = parsed.toString();
  } catch {
    url = connectionString.replace(/([?&])sslmode=[^&]*/g, "").replace(/\?&/, "?").replace(/\?$/, "");
  }

  let ssl: { ca: string; rejectUnauthorized: true } | { rejectUnauthorized: false } | undefined;
  if (isRds) {
    const caPath = path.join(process.cwd(), "rds-ca-bundle.pem");
    ssl = fs.existsSync(caPath)
      ? { ca: fs.readFileSync(caPath, "utf8"), rejectUnauthorized: true }
      : { rejectUnauthorized: false };
  }

  return new Pool({ connectionString: url, ssl });
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

  const pool = createPgPool(url);
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
