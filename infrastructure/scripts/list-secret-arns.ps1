# Prints Secrets Manager ARNs (safe to copy into CloudFormation commands).
param([string]$Region = "ap-southeast-2", [string]$Prefix = "flatmate-finance")

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$names = @(
  "$Prefix/db-password",
  "$Prefix/auth-secret",
  "$Prefix/database-url",
  "$Prefix/google-oauth",
  "$Prefix/resend"
)

Write-Host "Region: $Region`n"

foreach ($name in $names) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  $arn = aws secretsmanager describe-secret --secret-id $name --region $Region --query ARN --output text 2>&1
  $ErrorActionPreference = $prev

  if ($LASTEXITCODE -eq 0) {
    Write-Host "$name"
    Write-Host "  $arn`n"
  } else {
    Write-Host "$name"
    Write-Host "  (not created yet)`n"
  }
}

$dbArn = aws secretsmanager describe-secret --secret-id "$Prefix/db-password" --region $Region --query ARN --output text 2>$null
if ($LASTEXITCODE -eq 0 -and $dbArn) {
  Write-Host "--- RDS deploy (full ARN required, not just the suffix) ---"
  Write-Host "If stack is ROLLBACK_COMPLETE, delete first:"
  Write-Host "  aws cloudformation delete-stack --stack-name flatmate-finance-rds --region $Region"
  Write-Host ""
  Write-Host "aws cloudformation deploy ``"
  Write-Host "  --stack-name flatmate-finance-rds ``"
  Write-Host "  --template-file infrastructure/cloudformation/05-rds.yaml ``"
  Write-Host "  --parameter-overrides DbPasswordSecretArn=$dbArn ``"
  Write-Host "  --region $Region"
  Write-Host ""
}

Write-Host "Use database-url, auth-secret, google-oauth, resend ARNs for 09-ecs-app.yaml."
