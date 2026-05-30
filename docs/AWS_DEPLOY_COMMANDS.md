# AWS deploy commands (PowerShell)

Account **957411488700**, region **ap-southeast-2**, repo **maazjavid/flatmatefinance**, branch **`dev`**.

**First test URL:** CloudFront default (`https://dxxxx.cloudfront.net`).  
**Final URL:** `https://flatmatesettle.online` (Cloudflare — after AWS works).

---

## Progress checklist

| Step | Stack / action | Status |
|------|----------------|--------|
| 0 | AWS CLI + Docker local test | You did this |
| 1 | Secrets Manager (`setup-secrets.ps1`, `setup-app-secrets-from-env.ps1`) | You did this |
| 2 | `flatmate-finance-vpc` | **Done** |
| 3 | `flatmate-finance-sg` | **Done** |
| 4 | `flatmate-finance-iam` | **Next** |
| 5 | `flatmate-finance-rds` (~10 min) | After IAM |
| 6 | `update-database-url-secret.ps1` | After RDS available |
| 7 | `flatmate-finance-ecs` + `flatmate-finance-alb` | After RDS |
| 8 | `flatmate-finance-cf` (CloudFront URL) | After ALB |
| 9 | ECR repo + push image | After CF URL known |
| 10 | `flatmate-finance-ecs-app` | After image in ECR |
| 11 | GitHub Actions secrets + push `dev` | See below |
| 12 | Custom domain `flatmatesettle.online` | Last |

---

## GitHub Actions (when to enable)

The workflow `.github/workflows/deploy.yml` runs on push to **`dev`**.

| When | What happens |
|------|----------------|
| **Now** (no `AWS_ROLE_ARN` secret) | Workflow is **skipped** (valid YAML, no deploy job) |
| **After IAM stack** | Add `AWS_ROLE_ARN` → workflow builds & pushes Docker image to ECR |
| **After ECS service exists** | `Force new ECS deployment` step starts succeeding |
| **After CloudFront stack** | Add `CLOUDFRONT_DISTRIBUTION_ID` + `APP_URL` → cache invalidation works |

**Not an AWS-setup bug:** The error you saw was invalid YAML (`secrets` in `if:`). That is fixed on `dev` after you pull/push the workflow fix.

---

## 0. Prerequisites

```powershell
$env:Path += ";C:\Program Files\Amazon\AWSCLIV2\"
aws configure set region ap-southeast-2
aws sts get-caller-identity
```

---

## 1. List secret ARNs (anytime)

```powershell
.\infrastructure\scripts\list-secret-arns.ps1
```

---

## 2. IAM — **do this next** (GitHub OIDC + ECS roles)

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-iam `
  --template-file infrastructure/cloudformation/06-iam.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides GitHubOrg=maazjavid GitHubRepo=flatmatefinance `
  --region ap-southeast-2
```

Get role ARN for GitHub:

```powershell
aws cloudformation describe-stacks `
  --stack-name flatmate-finance-iam `
  --region ap-southeast-2 `
  --query "Stacks[0].Outputs[?OutputKey=='GitHubActionsRoleArn'].OutputValue" `
  --output text
```

**GitHub → repo → Settings → Secrets and variables → Actions:**

| Secret | When to add |
|--------|-------------|
| `AWS_ROLE_ARN` | After IAM stack (paste ARN above) |
| `APP_URL` | After CloudFront (`https://dxxxx.cloudfront.net`) |
| `CLOUDFRONT_DISTRIBUTION_ID` | After CloudFront stack output |

---

## 3. RDS (~10 minutes)

Use your **db-password** ARN (from `list-secret-arns.ps1`):

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-rds `
  --template-file infrastructure/cloudformation/05-rds.yaml `
  --parameter-overrides DbPasswordSecretArn=arn:aws:secretsmanager:ap-southeast-2:957411488700:secret:flatmate-finance/db-password-XXXX `
  --region ap-southeast-2
```

Wait until status **CREATE_COMPLETE**, then:

```powershell
.\infrastructure\scripts\update-database-url-secret.ps1
```

---

## 4. ECS cluster + ALB

```powershell
aws cloudformation deploy --stack-name flatmate-finance-ecs --template-file infrastructure/cloudformation/07-ecs-cluster.yaml --region ap-southeast-2

aws cloudformation deploy --stack-name flatmate-finance-alb --template-file infrastructure/cloudformation/08-alb.yaml --region ap-southeast-2
```

---

## 5. CloudFront (first public URL)

```powershell
aws cloudformation deploy --stack-name flatmate-finance-cf --template-file infrastructure/cloudformation/11-cloudfront.yaml --region ap-southeast-2

$cf = aws cloudformation describe-stacks --stack-name flatmate-finance-cf --region ap-southeast-2 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text
$cfId = aws cloudformation describe-stacks --stack-name flatmate-finance-cf --region ap-southeast-2 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDistributionId'].OutputValue" --output text
Write-Host "APP_URL: https://$cf"
Write-Host "CLOUDFRONT_DISTRIBUTION_ID: $cfId"
```

Add Google OAuth redirect: `https://$cf/api/auth/callback/google`

Add GitHub secrets `APP_URL` and `CLOUDFRONT_DISTRIBUTION_ID`.

---

## 6. ECR + Docker image

```powershell
.\infrastructure\scripts\create-ecr.ps1
.\infrastructure\scripts\push-ecr.ps1 -AppUrl "https://$cf"
```

---

## 7. ECS app service

Replace ARNs from `list-secret-arns.ps1`:

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-ecs-app `
  --template-file infrastructure/cloudformation/09-ecs-app.yaml `
  --parameter-overrides `
    ImageUri=957411488700.dkr.ecr.ap-southeast-2.amazonaws.com/flatmate-finance:latest `
    DatabaseUrlSecretArn=DATABASE_URL_ARN `
    AuthSecretArn=AUTH_SECRET_ARN `
    GoogleOAuthSecretArn=GOOGLE_OAUTH_ARN `
    ResendSecretArn=RESEND_ARN `
    AppUrl=https://$cf `
  --region ap-southeast-2
```

Smoke test:

```powershell
curl "https://$cf/api/health"
```

---

## 8. Push code to `dev`

Safe to push: infrastructure, Docker, app code, `.env.example`, docs.

**Never push:** `.env.local`, `.env`, `dev.db`, `node_modules`, `.next`

After workflow fix is on `dev`, GitHub will accept the workflow file. Deploy job runs only when `AWS_ROLE_ARN` is set.

---

## 9. Later — custom domain (Cloudflare)

1. Point `flatmatesettle.online` to CloudFront.
2. Redeploy ECS with `AppUrl=https://flatmatesettle.online`.
3. Rebuild image: `.\infrastructure\scripts\push-ecr.ps1 -AppUrl "https://flatmatesettle.online"`.
4. Update Google redirect + GitHub `APP_URL`.
