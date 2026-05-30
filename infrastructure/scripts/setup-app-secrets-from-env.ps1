# Reads OAuth + Resend (+ optional EMAIL_FROM) from .env.local → AWS Secrets Manager.
# Run locally after: aws configure / login as account 957411488700
param(
  [string]$Region = "ap-southeast-2",
  [string]$Prefix = "flatmate-finance",
  [string]$EnvFile = ".env.local"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile — copy .env.example and fill in your values."
}

function Get-EnvValue([string]$Key) {
  foreach ($line in Get-Content $EnvFile) {
    if ($line -match "^\s*#" -or $line -notmatch "^\s*$Key\s*=") { continue }
    $eq = $line.IndexOf("=")
    if ($eq -lt 0) { continue }
    $value = $line.Substring($eq + 1).Trim()
    if ($value.Length -ge 2) {
      if (
        ($value.StartsWith('"') -and $value.EndsWith('"')) -or
        ($value.StartsWith("'") -and $value.EndsWith("'"))
      ) {
        $value = $value.Substring(1, $value.Length - 2)
      }
    }
    return $value.Trim()
  }
  return $null
}

$googleId = Get-EnvValue "GOOGLE_CLIENT_ID"
$googleSecret = Get-EnvValue "GOOGLE_CLIENT_SECRET"
$resendKey = Get-EnvValue "RESEND_API_KEY"
$emailFrom = Get-EnvValue "EMAIL_FROM"
$resendFrom = Get-EnvValue "RESEND_FROM_EMAIL"
$fromAddress = if ($emailFrom) { $emailFrom } else { $resendFrom }

if (-not $googleId -or -not $googleSecret) {
  Write-Warning "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing in $EnvFile."
}
if (-not $resendKey) {
  Write-Warning "RESEND_API_KEY missing in $EnvFile."
}
if (-not $fromAddress) {
  Write-Warning "EMAIL_FROM / RESEND_FROM_EMAIL missing — forgot-password email will fail in AWS."
}

function Put-JsonSecret([string]$Name, [hashtable]$Object) {
  $json = ($Object | ConvertTo-Json -Compress)
  $prev = $ErrorActionPreference
  $ErrorActionPreference = "Continue"
  try {
    aws secretsmanager describe-secret --secret-id $Name --region $Region 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
      $out = aws secretsmanager put-secret-value --secret-id $Name --secret-string $json --region $Region 2>&1
      if ($LASTEXITCODE -ne 0) { throw "Failed to update '$Name': $out" }
      Write-Host "Updated secret: $Name"
    } else {
      $out = aws secretsmanager create-secret `
        --name $Name `
        --description "FlatMate Settle - $Name" `
        --secret-string $json `
        --region $Region 2>&1
      if ($LASTEXITCODE -ne 0) { throw "Failed to create '$Name': $out" }
      Write-Host "Created secret: $Name"
    }
  } finally {
    $ErrorActionPreference = $prev
  }
}

if ($googleId -and $googleSecret) {
  Put-JsonSecret "$Prefix/google-oauth" @{
    GOOGLE_CLIENT_ID     = $googleId
    GOOGLE_CLIENT_SECRET = $googleSecret
  }
}

if ($resendKey -and $fromAddress) {
  Put-JsonSecret "$Prefix/resend" @{
    RESEND_API_KEY    = $resendKey
    RESEND_FROM_EMAIL = $fromAddress
    EMAIL_FROM        = $fromAddress
  }
}

Write-Host ""
Write-Host "Describe ARNs (include the random suffix in deploy commands):"
Write-Host "  aws secretsmanager describe-secret --secret-id $Prefix/google-oauth --region $Region --query ARN --output text"
Write-Host "  aws secretsmanager describe-secret --secret-id $Prefix/resend --region $Region --query ARN --output text"
