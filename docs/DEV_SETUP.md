# Local development setup

Use this when cloning the repo on a new machine.

## Requirements

- **Node.js 24** (match `node -v` with teammates — native `better-sqlite3` is compiled for your Node ABI)
- **Yarn** 1.x (`yarn -v`)

> **Windows + Cursor:** Cursor ships its own Node 22 helper. If `node -v` in the integrated terminal shows v22 but PowerShell outside Cursor shows v24, add this to Cursor user settings so terminals use the same Node as the rest of your machine:
>
> ```json
> "terminal.integrated.env.windows": {
>   "PATH": "C:\\Program Files\\nodejs;${env:PATH}"
> }
> ```

## First-time setup

```bash
# 1. Install dependencies (postinstall rebuilds better-sqlite3 for your Node)
yarn install

# 2. Environment variables
cp .env.example .env.local
# Edit .env.local — see sections below

# 3. Database (SQLite file at prisma/dev.db)
yarn db:push
yarn db:generate

# 4. Run the app
yarn dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables (`.env.local`)

| Variable | Required | Notes |
|----------|----------|-------|
| `DATABASE_URL` | Yes | `file:./dev.db` for local SQLite |
| `AUTH_SECRET` | Yes | `openssl rand -base64 32` |
| `AUTH_URL` | Yes | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_URL` | Yes | Same as `AUTH_URL` locally |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | Optional | For “Continue with Google” |
| `RESEND_API_KEY` / `RESEND_FROM_EMAIL` | For forgot-password | See Resend section below |

## Resend (forgot-password emails)

1. Sign up at [https://resend.com](https://resend.com).
2. **API key:** Dashboard → **API Keys** → **Create API Key** → copy `re_...` into `.env.local`:
   ```env
   RESEND_API_KEY=re_xxxxxxxxxxxx
   ```
3. **From address (quick local test):** use Resend’s test sender (no domain verification):
   ```env
   RESEND_FROM_EMAIL=onboarding@resend.dev
   ```
4. **From address (real domain):** Dashboard → **Domains** → add your domain → add DNS records → after verification use e.g. `noreply@yourdomain.com` as `RESEND_FROM_EMAIL`.
5. Restart `yarn dev` after changing `.env.local`.

## Useful commands

| Command | Purpose |
|---------|---------|
| `yarn dev` | Next.js dev server |
| `yarn db:studio` | Prisma Studio (browse SQLite) |
| `yarn db:push` | Apply schema to local DB |
| `yarn db:generate` | Regenerate Prisma client |
| `yarn lint` | ESLint |

## Troubleshooting

### `better_sqlite3.node` / NODE_MODULE_VERSION mismatch

Your Node version changed after `yarn install`. Rebuild the native module:

```bash
npm rebuild better-sqlite3
# or
yarn install
```

### Prisma / webpack weird errors after big changes

```bash
# Stop dev server, then:
rm -rf .next   # PowerShell: Remove-Item -Recurse -Force .next
yarn dev
```

### Google sign-in works but create/join flat fails

Sign out and sign in again (old sessions may have had a bad user id before a fix). If it persists, check the terminal for `P2003` foreign-key errors.

### Port 3000 already in use

```powershell
# Find and kill the process (replace PID)
taskkill /PID <pid> /F /T
```

## What you do **not** need locally

- PostgreSQL (local dev uses SQLite)
- AWS S3 (receipts not wired yet)
- A separate Redis/cache service
