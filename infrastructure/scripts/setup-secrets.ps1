# Creates Secrets Manager entries in ap-southeast-2 (Sydney).
# Run once before deploying RDS / ECS stacks.
param(
  [string]$Region = "ap-southeast-2",
  [string]$Prefix = "flatmate-finance"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

function New-RandomSecret([int]$ByteCount = 32) {
  # RNGCryptoServiceProvider works on Windows PowerShell 5.1 (.NET Framework).
  $buffer = New-Object byte[] $ByteCount
  $rng = New-Object System.Security.Cryptography.RNGCryptoServiceProvider
  $rng.GetBytes($buffer)
  return [Convert]::ToBase64String($buffer)
}

function Test-AwsSecretExists([string]$Name) {
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    aws secretsmanager describe-secret --secret-id $Name --region $Region 2>&1 | Out-Null
    return ($LASTEXITCODE -eq 0)
  } finally {
    $ErrorActionPreference = $prev
  }
}

function Ensure-Secret([string]$Name, [string]$Value) {
  if (Test-AwsSecretExists $Name) {
    Write-Host "Secret exists, skipping create: $Name"
    return
  }

  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    $out = aws secretsmanager create-secret `
      --name $Name `
      --description "FlatMate Settle - $Name" `
      --secret-string $Value `
      --region $Region 2>&1
    if ($LASTEXITCODE -ne 0) {
      throw "Failed to create secret '$Name': $out"
    }
    Write-Host "Created secret: $Name"
  } finally {
    $ErrorActionPreference = $prev
  }
}

Write-Host "Using AWS region: $Region"
$identity = aws sts get-caller-identity --region $Region 2>&1
if ($LASTEXITCODE -ne 0) {
  throw "AWS login failed. Run: aws configure`n$identity"
}
Write-Host $identity

$dbPassword = New-RandomSecret 24
$authSecret = New-RandomSecret 32

Ensure-Secret "$Prefix/db-password" $dbPassword
Ensure-Secret "$Prefix/auth-secret" $authSecret
Ensure-Secret "$Prefix/database-url" "postgresql://flatmate_admin:PLACEHOLDER@localhost:5432/flatmate"

Write-Host ""
Write-Host "Copy your secret ARNs:"
Write-Host "  .\infrastructure\scripts\list-secret-arns.ps1"
Write-Host ""
Write-Host "Next: upload Google/Resend from .env.local:"
Write-Host "  .\infrastructure\scripts\setup-app-secrets-from-env.ps1"
Write-Host ""
Write-Host "Then deploy RDS and run:"
Write-Host "  .\infrastructure\scripts\update-database-url-secret.ps1"
