# AWS deploy commands (PowerShell)

Account **957411488700**, region **ap-southeast-2**, repo **maazjavid/flatmatefinance**, branch **`dev`**.

**Production URL:** `https://flatmatesettle.online` (Cloudflare → ALB, no CloudFront required).  
**Detailed guide from ECS+ALB onward:** [`docs/DEPLOY_FLATMATESETTLE_ONLINE.md`](DEPLOY_FLATMATESETTLE_ONLINE.md)

---

## Progress checklist

| Step | Stack / action | Status |
|------|----------------|--------|
| 0 | AWS CLI + Docker local test | **Done** |
| 1 | Core secrets (`setup-secrets.ps1`) | **Done** |
| 1b | App secrets (`setup-app-secrets-from-env.ps1`) | **Do before ECS app** — google-oauth + resend if missing |
| 2 | `flatmate-finance-vpc` | **Done** |
| 3 | `flatmate-finance-sg` | **Done** |
| 4 | `flatmate-finance-iam` + GitHub `AWS_ROLE_ARN` | **Done** |
| 5 | `flatmate-finance-rds` (~8 min) | **Done** |
| 6 | `update-database-url-secret.ps1` | **Done** |
| 6b | `create-ecr.ps1` (ECR repo) | **Done** — required before GitHub push works |
| 7 | `flatmate-finance-ecs` + `flatmate-finance-alb` | **Done** |
| 8 | TLS (ACM) + Cloudflare DNS → ALB | **Next** — see `DEPLOY_FLATMATESETTLE_ONLINE.md` |
| 9 | Image in ECR (`push-ecr.ps1` with production URL) | Same guide |
| 10 | `flatmate-finance-ecs-app` | Same guide |
| 11 | RDS schema (`prisma db push`) + smoke test | Same guide |
| 12 | GitHub `APP_URL` = `https://flatmatesettle.online` | No CloudFront secret needed |
| — | `flatmate-finance-cf` (optional later) | Skip for now |

---

## You are here — flatmatesettle.online (no CloudFront)

**Full steps:** [`docs/DEPLOY_FLATMATESETTLE_ONLINE.md`](DEPLOY_FLATMATESETTLE_ONLINE.md)

Summary: ACM + Cloudflare DNS → ALB → push ECR → `09-ecs-app` → `prisma db push` → smoke test.

### Legacy: CloudFront-first path (optional — skip if using custom domain on ALB)

### C. CloudFront (optional — skip for flatmatesettle.online)

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-cf `
  --template-file infrastructure/cloudformation/11-cloudfront.yaml `
  --region ap-southeast-2

$cf = aws cloudformation describe-stacks `
  --stack-name flatmate-finance-cf `
  --region ap-southeast-2 `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" `
  --output text
$cfId = aws cloudformation describe-stacks `
  --stack-name flatmate-finance-cf `
  --region ap-southeast-2 `
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" `
  --output text
Write-Host "APP_URL: https://$cf"
Write-Host "CLOUDFRONT_DISTRIBUTION_ID: $cfId"
```

**GitHub → Settings → Secrets → Actions:** add `APP_URL` = `https://$cf` and `CLOUDFRONT_DISTRIBUTION_ID` = `$cfId`.

**Google Cloud Console:** OAuth redirect URI = `https://$cf/api/auth/callback/google`

### D. Push Docker image

Either local push:

```powershell
.\infrastructure\scripts\push-ecr.ps1 -AppUrl "https://$cf"
```

Or re-run the **Deploy to AWS** workflow on `dev` (ECR repo already exists).

### E. ECS app service

Replace ARNs from `list-secret-arns.ps1` (full ARNs, not suffixes):

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-ecs-app `
  --template-file infrastructure/cloudformation/09-ecs-app.yaml `
  --parameter-overrides `
    ImageUri=957411488700.dkr.ecr.ap-southeast-2.amazonaws.com/flatmate-finance:latest `
    DatabaseUrlSecretArn=PASTE_DATABASE_URL_ARN `
    AuthSecretArn=PASTE_AUTH_SECRET_ARN `
    GoogleOAuthSecretArn=PASTE_GOOGLE_OAUTH_ARN `
    ResendSecretArn=PASTE_RESEND_ARN `
    AppUrl=https://$cf `
  --region ap-southeast-2
```

Smoke test:

```powershell
curl "https://$cf/api/health"
```

### F. Schema on RDS (first deploy)

Run once against the live database (from a machine that can reach RDS, or a one-off task):

```powershell
# Example: use DATABASE_URL from Secrets Manager locally (temporary), then:
yarn prisma db push
```

---

## Lessons from step 5 (RDS) — read before redeploying RDS

| Mistake | What happened | Fix |
|---------|----------------|-----|
| `DbPasswordSecretArn=-kILFKm` (suffix only) | *Secrets Manager can't find the specified secret* | Use **full ARN** from `list-secret-arns.ps1` |
| Stack `ROLLBACK_COMPLETE` | Cannot update in place | `aws cloudformation delete-stack --stack-name flatmate-finance-rds --region ap-southeast-2`, wait, redeploy |
| `BackupRetentionPeriod: 7` on **Free Tier** | Backup retention exceeds free tier max | Template default is **1** day |
| `db.t3.small` on **Free Tier** | Instance size not available | Template default is **`db.t3.micro`** |
| Postgres `16.4` in Sydney | Version not offered in region | Template default is **`16.9`** — check with `aws rds describe-db-engine-versions --engine postgres --region ap-southeast-2` |

**Working deploy** (already applied for this account; for reference):

```powershell
.\infrastructure\scripts\list-secret-arns.ps1
# Script prints a copy-paste deploy command with the full db-password ARN.

aws cloudformation deploy `
  --stack-name flatmate-finance-rds `
  --template-file infrastructure/cloudformation/05-rds.yaml `
  --parameter-overrides `
    DbPasswordSecretArn=arn:aws:secretsmanager:ap-southeast-2:957411488700:secret:flatmate-finance/db-password-kILFKm `
    BackupRetentionPeriod=1 `
    DbInstanceClass=db.t3.micro `
    EngineVersion=16.9 `
  --region ap-southeast-2

.\infrastructure\scripts\update-database-url-secret.ps1
```

After you **upgrade** off AWS Free Tier, you can redeploy RDS with `DbInstanceClass=db.t3.small` and `BackupRetentionPeriod=7` (optional).

---

## GitHub Actions

Workflow: `.github/workflows/deploy.yml` (push to **`dev`**).

| When | What happens |
|------|----------------|
| No `AWS_ROLE_ARN` | Build/deploy steps skipped (workflow still green) |
| `AWS_ROLE_ARN` set, **no ECR repo** | Fails at **Build and push app image** (`RepositoryNotFoundException`) — run `create-ecr.ps1` first |
| ECR repo exists | Image builds and pushes |
| No ECS service yet | **Force new ECS deployment** fails harmlessly (`continue-on-error: true`) |
| After `flatmate-finance-ecs-app` | ECS redeploy step succeeds |
| After CloudFront + secrets | Cache invalidation runs when `CLOUDFRONT_DISTRIBUTION_ID` is set |

| Secret | When |
|--------|------|
| `AWS_ROLE_ARN` | After IAM stack |
| `APP_URL` | After CloudFront domain known |
| `CLOUDFRONT_DISTRIBUTION_ID` | After CloudFront stack |

**Re-run workflow:** GitHub → Actions → failed run → **Re-run all jobs**, or push to `dev`.

---

## Reference — all steps

### 0. Prerequisites

```powershell
$env:Path += ";C:\Program Files\Amazon\AWSCLIV2\"
aws configure set region ap-southeast-2
aws sts get-caller-identity
```

### 1. Secrets

```powershell
.\infrastructure\scripts\setup-secrets.ps1
.\infrastructure\scripts\setup-app-secrets-from-env.ps1
.\infrastructure\scripts\list-secret-arns.ps1
```

### 2–3. VPC + security groups (done)

```powershell
aws cloudformation deploy --stack-name flatmate-finance-vpc --template-file infrastructure/cloudformation/01-vpc.yaml --region ap-southeast-2
aws cloudformation deploy --stack-name flatmate-finance-sg --template-file infrastructure/cloudformation/02-security-groups.yaml --region ap-southeast-2
```

### 4. IAM (done)

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-iam `
  --template-file infrastructure/cloudformation/06-iam.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides GitHubOrg=maazjavid GitHubRepo=flatmatefinance `
  --region ap-southeast-2
```

### 5–6. RDS + database URL (done)

See **Lessons from step 5** above.

### 6b. ECR repo (done)

```powershell
.\infrastructure\scripts\create-ecr.ps1
```

### 7–12

See **You are here** section at the top.

---

## Push code to `dev`

Safe to push: infrastructure, Docker, app code, `.env.example`, docs.

**Never push:** `.env.local`, `.env`, `dev.db`, `node_modules`, `.next`

---

## Later — custom domain (Cloudflare)

1. Point `flatmatesettle.online` to CloudFront.
2. Redeploy ECS with `AppUrl=https://flatmatesettle.online`.
3. Rebuild: `.\infrastructure\scripts\push-ecr.ps1 -AppUrl "https://flatmatesettle.online"`.
4. Update Google redirect + GitHub `APP_URL`.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| RDS secret not found | Full ARN for `DbPasswordSecretArn`, not `-kILFKm` suffix |
| RDS Free Tier errors | `db.t3.micro`, `BackupRetentionPeriod=1`, `EngineVersion=16.9` |
| GitHub push fails | Run `create-ecr.ps1`; re-run workflow |
| `gh` not in PATH on Windows | Use GitHub website Actions tab |
| ECS cluster: *Unable to assume the service linked role* | One-time per account: `aws iam create-service-linked-role --aws-service-name ecs.amazonaws.com` (ignore if role already exists). Delete stack if `ROLLBACK_COMPLETE`, then redeploy. |
| Health 503 after deploy | `database-url` secret, Prisma schema on RDS, security groups |
| NextAuth redirect errors | `AppUrl` / `APP_URL` = public CloudFront URL |
