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

docker push $image

Write-Host "Pushed: $image"
