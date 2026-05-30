# Deploy S3 bucket for payment proof uploads and grant ECS task role access.
# Run from repo root: .\infrastructure\scripts\deploy-s3-proofs.ps1
param(
  [string]$Region = "ap-southeast-2",
  [string]$ProjectName = "flatmate-finance"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $RepoRoot

$template = Join-Path $RepoRoot "infrastructure\cloudformation\12-s3-payment-proofs.yaml"
$stackName = "$ProjectName-s3-proofs"

Write-Host "Deploying $stackName ..."
aws cloudformation deploy `
  --stack-name $stackName `
  --template-file $template `
  --parameter-overrides "ProjectName=$ProjectName" `
  --region $Region `
  --no-fail-on-empty-changeset

if ($LASTEXITCODE -ne 0) { throw "CloudFormation deploy failed." }

$bucket = aws cloudformation describe-stacks `
  --stack-name $stackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='PaymentProofsBucketName'].OutputValue" `
  --output text

Write-Host ""
Write-Host "S3 bucket ready: $bucket"
Write-Host ""
Write-Host "Next steps:"
Write-Host "  1. Redeploy ECS app so the task gets S3_BUCKET_NAME (uses ImportValue automatically):"
Write-Host "       See docs/AWS_DEPLOY_COMMANDS.md section 'Payment proofs (S3)'"
Write-Host "  2. Push to dev branch (or force ECS deployment) so the app image includes rent/upload code."
Write-Host "  3. Run prisma-db-push-rds.ps1 if you have not applied the rent schema yet."
Write-Host ""
