import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  // Keep node-only DB packages out of the client bundle.
  serverExternalPackages: [
    "@prisma/client",
    "@prisma/adapter-better-sqlite3",
    "@prisma/adapter-pg",
    "better-sqlite3",
    "pg",
  ],
};

export default nextConfig;
