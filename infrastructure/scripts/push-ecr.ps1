param(
  [string]$Region = "ap-southeast-2",
  [string]$Tag = "latest",
  [string]$AppUrl = "https://placeholder.example"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath
$accountId = (aws sts get-caller-identity --query Account --output text)
$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"

aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry

$image = "$registry/flatmate-finance:$Tag"

docker build `
  -f Dockerfile `
  --build-arg NEXT_PUBLIC_APP_URL=$AppUrl `
  -t $image `
  .
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker build failed. Is Docker Desktop running?"
}

docker push $image
if ($LASTEXITCODE -ne 0) {
  Write-Error "docker push failed."
}

Write-Host "Pushed: $image"
Write-Host "ECS will pull :latest on the next deployment (or run: aws ecs update-service --cluster flatmate-finance-cluster --service flatmate-finance-app --force-new-deployment --region $Region)"
