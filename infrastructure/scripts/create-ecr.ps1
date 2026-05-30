param([string]$Region = "ap-southeast-2")

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath
$repo = "flatmate-finance"

$exists = aws ecr describe-repositories --repository-names $repo --region $Region 2>$null
if ($LASTEXITCODE -eq 0) {
  Write-Host "ECR repo exists: $repo"
  exit 0
}

aws ecr create-repository `
  --repository-name $repo `
  --image-scanning-configuration scanOnPush=true `
  --encryption-configuration encryptionType=AES256 `
  --region $Region | Out-Null

Write-Host "Created ECR repo: $repo"
