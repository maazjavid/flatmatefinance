# Reads OAuth + Resend (+ optional EMAIL_FROM) from .env.local → AWS Secrets Manager.
# Run from repo root: .\infrastructure\scripts\setup-app-secrets-from-env.ps1
param(
  [string]$Region = "ap-southeast-2",
  [string]$Prefix = "flatmate-finance",
  [string]$EnvFile = ""
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
if (-not $EnvFile) {
  $EnvFile = Join-Path $RepoRoot ".env.local"
}
if (-not (Test-Path $EnvFile)) {
  Write-Error "Missing $EnvFile - copy .env.example and fill in GOOGLE_* and RESEND_*."
}

function Get-EnvValue([string]$Key) {
  foreach ($line in Get-Content -LiteralPath $EnvFile) {
    if ($line -match '^\s*#' -or $line -notmatch "^\s*$([regex]::Escape($Key))\s*=") { continue }
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

Write-Host "Using env file: $EnvFile`n"

if (-not $googleId -or -not $googleSecret) {
  Write-Warning "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET missing in $EnvFile - google-oauth secret skipped."
}
if (-not $resendKey) {
  Write-Warning "RESEND_API_KEY missing in $EnvFile - resend secret skipped."
}
if (-not $fromAddress) {
  Write-Warning "EMAIL_FROM / RESEND_FROM_EMAIL missing - resend secret skipped."
}

function Put-JsonSecret([string]$Name, [hashtable]$Object) {
  $json = ($Object | ConvertTo-Json -Compress)
  $tempFile = Join-Path $env:TEMP ("fm-secret-{0}.json" -f ([guid]::NewGuid().ToString("N")))
  try {
    [System.IO.File]::WriteAllText($tempFile, $json, [System.Text.UTF8Encoding]::new($false))
    $fileUri = "file://" + ($tempFile -replace '\\', '/')

    $prev = $ErrorActionPreference
    $ErrorActionPreference = "Continue"
    aws secretsmanager describe-secret --secret-id $Name --region $Region *> $null
    $exists = $LASTEXITCODE -eq 0
    if ($exists) {
      $out = aws secretsmanager put-secret-value --secret-id $Name --secret-string "file://$($tempFile -replace '\\','/')" --region $Region 2>&1
      if ($LASTEXITCODE -ne 0) { throw "Failed to update '$Name': $out" }
      Write-Host "Updated secret: $Name"
    } else {
      $out = aws secretsmanager create-secret `
        --name $Name `
        --description "FlatMate Settle - $Name" `
        --secret-string "file://$($tempFile -replace '\\','/')" `
        --region $Region 2>&1
      if ($LASTEXITCODE -ne 0) { throw "Failed to create '$Name': $out" }
      Write-Host "Created secret: $Name"
    }
    $arn = aws secretsmanager describe-secret --secret-id $Name --region $Region --query ARN --output text 2>&1
    if ($LASTEXITCODE -eq 0) { Write-Host "  ARN: $arn`n" }
  } finally {
    $ErrorActionPreference = $prev
    if (Test-Path $tempFile) { Remove-Item -LiteralPath $tempFile -Force }
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

Write-Host "Run .\infrastructure\scripts\list-secret-arns.ps1 to verify all ARNs."
