param(
  [string]$Region = "ap-southeast-2",
  [string]$ProjectName = "flatmate-finance",
  [string]$GitHubOrg = "YOUR_GITHUB_ORG"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath
$cf = Join-Path $PSScriptRoot "..\cloudformation"

function Deploy-CfnStack($Name, $Template, $Parameters = @()) {
  $paramArgs = @()
  foreach ($p in $Parameters) { $paramArgs += $p }
  aws cloudformation deploy `
    --stack-name $Name `
    --template-file $Template `
    --capabilities CAPABILITY_NAMED_IAM `
    --region $Region `
    --no-fail-on-empty-changeset `
    @paramArgs | Out-Host
}

Deploy-CfnStack "$ProjectName-vpc" (Join-Path $cf "01-vpc.yaml")
Deploy-CfnStack "$ProjectName-sg" (Join-Path $cf "02-security-groups.yaml")
Deploy-CfnStack "$ProjectName-iam" (Join-Path $cf "06-iam.yaml") @(
  "ParameterKey=GitHubOrg,ParameterValue=$GitHubOrg"
)
Write-Host "Deploy RDS manually after setup-secrets.ps1 (takes ~10 min):"
Write-Host "  aws cloudformation deploy --stack-name $ProjectName-rds --template-file infrastructure/cloudformation/05-rds.yaml --parameter-overrides DbPasswordSecretArn=arn:aws:secretsmanager:$Region:ACCOUNT:secret:flatmate-finance/db-password-XXXX"
Write-Host ""
Write-Host "After ECR push and CloudFront URL exist, deploy the app service:"
Write-Host "  aws cloudformation deploy --stack-name $ProjectName-ecs-app --template-file infrastructure/cloudformation/09-ecs-app.yaml --parameter-overrides ImageUri=... DatabaseUrlSecretArn=... AuthSecretArn=... AppUrl=https://..."
