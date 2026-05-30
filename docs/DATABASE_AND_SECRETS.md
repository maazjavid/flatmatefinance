# Database & secrets — beginner guide

You do **not** paste AWS secrets into CloudFormation YAML or the Dockerfile.
You keep real values in **one local file** (`.env.local`), and AWS copies them into **Secrets Manager** with scripts.

---

## Three ways you run the app (three databases)

| How you start | Database | Where `DATABASE_URL` comes from |
|---------------|----------|----------------------------------|
| `yarn dev` | **SQLite** file `dev.db` on your PC | **You** set in `.env.local` (`file:./dev.db`) |
| `yarn prisma db push` (on PC) | Expects **PostgreSQL** URL | **Will fail** with `file:./dev.db` (P1013) — use `docker compose run migrate` locally or `prisma-db-push-rds.ps1` for AWS |
| `docker compose up` | **PostgreSQL** in Docker (`db` service) | **docker-compose.yml** overrides (not your SQLite URL) |
| AWS ECS + RDS | **PostgreSQL** on AWS RDS | **Secrets Manager** → injected into the container |

```text
yarn dev          →  dev.db (SQLite)     →  .env.local
docker compose    →  Postgres container  →  compose sets postgresql://...@db:5432/...
AWS production    →  RDS Postgres        →  secret flatmate-finance/database-url
```

The app picks the driver automatically in `src/lib/prisma.ts`:

- URL starts with `file:` → SQLite
- URL starts with `postgresql://` → PostgreSQL

---

## The only file YOU edit with real secrets

### `.env.local` (create from `.env.example`)

Location: project root, next to `package.json`.

- **Git ignores it** — never commit.
- **Next.js** loads it for `yarn dev`.
- **Docker Compose** loads it via `env_file: .env.local` for Google/Resend/Auth.
- **AWS script** reads it to upload Google + Resend to AWS.

Example shape (use your real values):

```env
# --- Database: LOCAL DEV ONLY (yarn dev) ---
DATABASE_URL="file:./dev.db"

# --- URLs (local) ---
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXTAUTH_URL=http://localhost:3000
AUTH_URL=http://localhost:3000

# --- Auth (you generate once, keep the same locally) ---
AUTH_SECRET=paste-your-long-random-string-here

# --- Google (from Google Cloud Console) ---
GOOGLE_CLIENT_ID=paste-here
GOOGLE_CLIENT_SECRET=paste-here

# --- Resend ---
RESEND_API_KEY=re_paste-here
EMAIL_FROM=FlatMate Settle <no-reply@support.flatmatesettle.online>
```

**Do not** put AWS RDS passwords in `.env.local` unless you are debugging production manually.

---

## Files you do NOT put secrets in

| File | What goes here |
|------|----------------|
| `.env.example` | Placeholder names only (committed to git) |
| `docker-compose.yml` | Fake local Postgres password only (`flatmate_local_dev`) |
| `Dockerfile` | No secrets |
| `infrastructure/cloudformation/*.yaml` | ARNs and public URLs as **parameters**, not passwords |
| GitHub repo | Only `AWS_ROLE_ARN`, `APP_URL`, `CLOUDFRONT_DISTRIBUTION_ID` as GitHub Actions secrets |

---

## Step 1 AWS scripts — what each one does

### A) `setup-secrets.ps1` — creates secrets **in AWS** (you paste nothing)

Run in PowerShell from repo root:

```powershell
.\infrastructure\scripts\setup-secrets.ps1
```

This **generates random** values in AWS for:

| Secret name in AWS | Purpose |
|--------------------|---------|
| `flatmate-finance/db-password` | RDS master password (AWS creates RDS with this) |
| `flatmate-finance/auth-secret` | Same role as `AUTH_SECRET` in production |
| `flatmate-finance/database-url` | Placeholder until RDS exists |

You do **not** open a file and type these in. The script creates them in **AWS Secrets Manager** (Sydney).

Your local `AUTH_SECRET` in `.env.local` can stay as-is for local dev. Production will use the **AWS** `auth-secret` (they can differ).

### B) `setup-app-secrets-from-env.ps1` — copies **from** `.env.local` **to** AWS

After `.env.local` has Google + Resend filled in:

```powershell
.\infrastructure\scripts\setup-app-secrets-from-env.ps1
```

Uploads to AWS:

| Secret name in AWS | Copied from `.env.local` |
|--------------------|---------------------------|
| `flatmate-finance/google-oauth` | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` |
| `flatmate-finance/resend` | `RESEND_API_KEY`, `EMAIL_FROM` |

Again: you do not edit YAML. You only maintain `.env.local` locally.

---

## How AWS connects the database (after RDS exists)

1. **RDS stack** creates PostgreSQL using password from `flatmate-finance/db-password`.
2. **`update-database-url-secret.ps1`** writes the real connection string into `flatmate-finance/database-url`, e.g.  
   `postgresql://flatmate_admin:xxx@your-rds-endpoint.ap-southeast-2.rds.amazonaws.com:5432/flatmate`
3. **ECS task** (`09-ecs-app.yaml`) maps that secret into the container as env var `DATABASE_URL`.
4. App starts → `src/lib/prisma.ts` sees `postgresql://` → connects to RDS.

You never paste the RDS URL into source code.

---

## Docker local — how DB connects (no AWS)

```text
db container (Postgres)
    ↑
    │  DATABASE_URL=postgresql://flatmate:flatmate_local_dev@db:5432/flatmate
    │
migrate container  →  yarn prisma db push  (creates tables)
    │
app container      →  node server.js  (your Next.js app)
```

`docker-compose.yml` line `environment: DATABASE_URL: postgresql://...` **overrides** SQLite from `.env.local` for the app service so Docker always uses Postgres.

Your `.env.local` can still say `file:./dev.db` for when you run `yarn dev` on the host.

---

## Checklist: first-time setup

### On your PC (once)

1. Copy `.env.example` → `.env.local`
2. Fill Google, Resend, `AUTH_SECRET`, keep `DATABASE_URL="file:./dev.db"` for `yarn dev`
3. Run `yarn install`

### Local test without AWS

```powershell
yarn dev                    # uses SQLite dev.db
docker compose up --build   # uses Docker Postgres (separate data)
```

### AWS (when ready)

1. `setup-secrets.ps1` — AWS creates db password + auth secret
2. `setup-app-secrets-from-env.ps1` — uploads Google/Resend from `.env.local`
3. Deploy VPC → IAM → RDS → update database-url secret → ECS + image

---

## Common confusion

**“Prisma schema says PostgreSQL but I use SQLite locally.”**  
Schema `provider = postgresql` is for Docker/AWS. Local SQLite still works because `DATABASE_URL` uses `file:./dev.db` and `prisma.ts` uses the SQLite adapter.

**“Do I put secrets in CloudFormation?”**  
Only **ARNs** (references), e.g. `DatabaseUrlSecretArn=arn:aws:secretsmanager:...`. Not the password text.

**“Step 1 — where do I add secrets in files?”**  
Nowhere new. Only `.env.local` for your keys; scripts push to AWS.
