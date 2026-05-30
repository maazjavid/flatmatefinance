# Redeploy ECS app stack (e.g. after S3 bucket or template env changes).
# Reads secret ARNs automatically. Run from repo root.
param(
  [string]$Region = "ap-southeast-2",
  [string]$ProjectName = "flatmate-finance",
  [string]$AppUrl = "https://flatmatesettle.online",
  [string]$ImageTag = "latest"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $RepoRoot

function Get-SecretArn([string]$Name) {
  $arn = aws secretsmanager describe-secret `
    --secret-id $Name `
    --region $Region `
    --query ARN `
    --output text 2>$null
  if ($LASTEXITCODE -ne 0 -or -not $arn) {
    throw "Secret not found: $Name — run setup-secrets.ps1 / setup-app-secrets-from-env.ps1"
  }
  return $arn
}

$accountId = aws sts get-caller-identity --query Account --output text
$imageUri = "$accountId.dkr.ecr.$Region.amazonaws.com/${ProjectName}:$ImageTag"

$dbArn = Get-SecretArn "$ProjectName/database-url"
$authArn = Get-SecretArn "$ProjectName/auth-secret"
$googleArn = Get-SecretArn "$ProjectName/google-oauth"
$resendArn = Get-SecretArn "$ProjectName/resend"

$s3StackName = "$ProjectName-s3-proofs"
$s3Bucket = aws cloudformation describe-stacks `
  --stack-name $s3StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='PaymentProofsBucketName'].OutputValue" `
  --output text 2>$null

$parameterOverrides = @(
  "ImageUri=$imageUri",
  "DatabaseUrlSecretArn=$dbArn",
  "AuthSecretArn=$authArn",
  "GoogleOAuthSecretArn=$googleArn",
  "ResendSecretArn=$resendArn",
  "AppUrl=$AppUrl"
)

if ($LASTEXITCODE -eq 0 -and $s3Bucket -and $s3Bucket -ne "None") {
  Write-Host "  S3 proofs bucket: $s3Bucket"
  $parameterOverrides += "PaymentProofsBucketName=$s3Bucket"
} else {
  Write-Warning "S3 stack '$s3StackName' not found — run deploy-s3-proofs.ps1 first (payment uploads need S3 on ECS)."
}

Write-Host "Deploying $ProjectName-ecs-app ..."
Write-Host "  Image: $imageUri"
Write-Host "  AppUrl: $AppUrl"

aws cloudformation deploy `
  --stack-name "$ProjectName-ecs-app" `
  --template-file "infrastructure/cloudformation/09-ecs-app.yaml" `
  --parameter-overrides $parameterOverrides `
  --region $Region `
  --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) { throw "ECS app stack deploy failed." }

Write-Host ""
Write-Host "Forcing new ECS deployment ..."
aws ecs update-service `
  --cluster "$ProjectName-cluster" `
  --service "$ProjectName-app" `
  --force-new-deployment `
  --region $Region `
  --output text `
  --query "service.serviceName"

Write-Host "Done. Wait for tasks to become RUNNING, then smoke-test /api/health"
