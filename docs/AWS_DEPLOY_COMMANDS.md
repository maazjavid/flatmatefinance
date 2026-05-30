# AWS deploy commands (PowerShell)

Account **957411488700**, region **ap-southeast-2**, repo **maazjavid/flatmatefinance**.

**First AWS test URL:** CloudFront default (`https://dxxxx.cloudfront.net`).  
**Final URL:** `https://flatmatesettle.online` (connect in Cloudflare after AWS works).

---

## 0. Prerequisites

```powershell
aws configure set region ap-southeast-2
aws sts get-caller-identity
# Expect Account: 957411488700
```

Start **Docker Desktop** before local compose.

---

## 1. Local Docker test

```powershell
cd C:\Users\dobig\Documents\GitHub\flatmatefinance
docker compose up --build
```

Another terminal:

```powershell
curl http://localhost:3000/api/health
# {"status":"ok","database":"connected"}
```

Stop: `docker compose down`

`.env.local` is loaded at **runtime** only (not baked into the image). `.dockerignore` excludes `.env.local` from the build context.

---

## 2. AWS secrets (Sydney)

```powershell
# Random RDS password + AUTH_SECRET + placeholder DATABASE_URL
.\infrastructure\scripts\setup-secrets.ps1

# Google + Resend from .env.local (never committed)
.\infrastructure\scripts\setup-app-secrets-from-env.ps1
```

List ARNs (copy full ARN including suffix):

```powershell
aws secretsmanager describe-secret --secret-id flatmate-finance/db-password --region ap-southeast-2 --query ARN --output text
aws secretsmanager describe-secret --secret-id flatmate-finance/auth-secret --region ap-southeast-2 --query ARN --output text
aws secretsmanager describe-secret --secret-id flatmate-finance/database-url --region ap-southeast-2 --query ARN --output text
aws secretsmanager describe-secret --secret-id flatmate-finance/google-oauth --region ap-southeast-2 --query ARN --output text
aws secretsmanager describe-secret --secret-id flatmate-finance/resend --region ap-southeast-2 --query ARN --output text
```

---

## 3. CloudFormation (order matters)

Replace `DB_PASSWORD_ARN` with the real `db-password` ARN from step 2.

### VPC + security groups

```powershell
aws cloudformation deploy --stack-name flatmate-finance-vpc --template-file infrastructure/cloudformation/01-vpc.yaml --region ap-southeast-2
aws cloudformation deploy --stack-name flatmate-finance-sg --template-file infrastructure/cloudformation/02-security-groups.yaml --region ap-southeast-2
```

### IAM (GitHub OIDC + ECS roles)

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-iam `
  --template-file infrastructure/cloudformation/06-iam.yaml `
  --capabilities CAPABILITY_NAMED_IAM `
  --parameter-overrides GitHubOrg=maazjavid GitHubRepo=flatmatefinance `
  --region ap-southeast-2
```

Note output `GitHubActionsRoleArn` for GitHub secret `AWS_ROLE_ARN`.

### RDS (~10 minutes)

```powershell
aws cloudformation deploy `
  --stack-name flatmate-finance-rds `
  --template-file infrastructure/cloudformation/05-rds.yaml `
  --parameter-overrides DbPasswordSecretArn=DB_PASSWORD_ARN `
  --region ap-southeast-2
```

```powershell
.\infrastructure\scripts\update-database-url-secret.ps1
```

### ECS cluster + ALB

```powershell
aws cloudformation deploy --stack-name flatmate-finance-ecs --template-file infrastructure/cloudformation/07-ecs-cluster.yaml --region ap-southeast-2
aws cloudformation deploy --stack-name flatmate-finance-alb --template-file infrastructure/cloudformation/08-alb.yaml --region ap-southeast-2
```

### CloudFront (first public URL)

```powershell
aws cloudformation deploy --stack-name flatmate-finance-cf --template-file infrastructure/cloudformation/11-cloudfront.yaml --region ap-southeast-2
```

```powershell
$cf = aws cloudformation describe-stacks --stack-name flatmate-finance-cf --region ap-southeast-2 --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomainName'].OutputValue" --output text
Write-Host "First test URL: https://$cf"
```

Add Google OAuth redirect: `https://$cf/api/auth/callback/google`

---

## 4. ECR + Docker image

```powershell
.\infrastructure\scripts\create-ecr.ps1
```

Build/push (use CloudFront URL for first test, or `https://flatmatesettle.online` when ready):

```powershell
.\infrastructure\scripts\push-ecr.ps1 -AppUrl "https://$cf"
```

Image URI example: `957411488700.dkr.ecr.ap-southeast-2.amazonaws.com/flatmate-finance:latest`

---

## 5. ECS app service

Replace `*_ARN` placeholders from step 2. `AppUrl` = CloudFront URL for first test.

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
    AppUrl=https://YOUR_CLOUDFRONT_DOMAIN `
  --region ap-southeast-2
```

Smoke test:

```powershell
curl "https://$cf/api/health"
```

---

## 6. Later — custom domain (Cloudflare)

1. Point `flatmatesettle.online` CNAME to CloudFront (or ALB per your CF template).
2. Redeploy ECS with `AppUrl=https://flatmatesettle.online`.
3. Rebuild/push image with `-AppUrl https://flatmatesettle.online`.
4. Update Google OAuth redirect to `https://flatmatesettle.online/api/auth/callback/google`.
5. GitHub secret `APP_URL=https://flatmatesettle.online`.

Production email (already in Secrets Manager via script):

`FlatMate Settle <no-reply@support.flatmatesettle.online>`
