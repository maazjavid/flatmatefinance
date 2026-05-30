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

Write-Host "Use db-password ARN for RDS stack (DbPasswordSecretArn)."
Write-Host "Use database-url, auth-secret, google-oauth, resend ARNs for 09-ecs-app.yaml."
