param(
  [string]$Region = "ap-southeast-2",
  [string]$Prefix = "flatmate-finance",
  [string]$StackName = "flatmate-finance-rds"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$dbHost = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DbEndpoint'].OutputValue" `
  --output text

$dbName = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DbName'].OutputValue" `
  --output text

$dbUser = aws cloudformation describe-stacks `
  --stack-name $StackName `
  --region $Region `
  --query "Stacks[0].Outputs[?OutputKey=='DbUsername'].OutputValue" `
  --output text

$dbPassword = aws secretsmanager get-secret-value `
  --secret-id "$Prefix/db-password" `
  --region $Region `
  --query SecretString `
  --output text

$encodedPassword = [uri]::EscapeDataString($dbPassword)
$databaseUrl = "postgresql://${dbUser}:${encodedPassword}@${dbHost}:5432/${dbName}"

aws secretsmanager put-secret-value `
  --secret-id "$Prefix/database-url" `
  --secret-string $databaseUrl `
  --region $Region | Out-Null

Write-Host "Updated $Prefix/database-url -> $dbHost"
