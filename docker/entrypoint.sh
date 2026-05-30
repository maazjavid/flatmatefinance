#!/usr/bin/env sh
set -eu

# For local docker-compose we keep it simple:
# - ensure Prisma client exists (already generated during build)
# - push schema to the Postgres container (no migrations required)

if [ "${RUN_PRISMA_DB_PUSH:-true}" = "true" ]; then
  echo "Running: prisma db push"
  npx prisma db push
fi

exec "$@"

