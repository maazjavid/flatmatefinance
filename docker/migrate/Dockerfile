FROM node:22-alpine
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma.config.ts ./
COPY docker/prisma/schema.postgresql.prisma ./prisma/schema.prisma
RUN npx prisma generate
CMD ["npx", "prisma", "db", "push", "--skip-generate"]
