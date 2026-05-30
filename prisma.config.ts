import { config as loadEnv } from "dotenv";
import { defineConfig } from "prisma/config";
import path from "node:path";

// Prisma CLI does not read `.env.local` automatically — load it explicitly.
// Order: `.env.local` (Next.js / local secrets) then `.env`.
loadEnv({ path: path.resolve(process.cwd(), ".env.local") });
loadEnv({ path: path.resolve(process.cwd(), ".env") });

const databaseUrl =
  process.env.DATABASE_URL?.trim() || "file:./dev.db";

/**
 * Prisma v7 project config.
 * `datasource.url` is required here (not in schema.prisma) for `db push`,
 * `migrate`, and `studio`.
 *
 * Local: `file:./dev.db` + `prisma/schema.prisma` (provider sqlite).
 * AWS/Docker: postgres URL + `docker/prisma/schema.postgresql.prisma` at build/migrate time.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: databaseUrl,
  },
  migrations: {
    path: "prisma/migrations",
  },
});
