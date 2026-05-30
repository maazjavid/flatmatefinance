# Apply Prisma schema to AWS RDS (private VPC). Runs a one-off Fargate task inside the same network as ECS app.
param(
  [string]$Region = "ap-southeast-2",
  [string]$ProjectName = "flatmate-finance",
  [string]$Cluster = "flatmate-finance-cluster"
)

$ErrorActionPreference = "Stop"
. "$PSScriptRoot\_aws-cli.ps1"
Ensure-AwsCliOnPath

$RepoRoot = (Resolve-Path (Join-Path $PSScriptRoot "..\..")).Path
Set-Location $RepoRoot

Write-Host "Fetching DATABASE_URL from Secrets Manager..."
$databaseUrl = aws secretsmanager get-secret-value `
  --secret-id "$ProjectName/database-url" `
  --region $Region `
  --query SecretString `
  --output text

$accountId = aws sts get-caller-identity --query Account --output text
$registry = "$accountId.dkr.ecr.$Region.amazonaws.com"
$migrateImage = "$registry/${ProjectName}:migrate"

Write-Host "Building migrate image (Dockerfile target=build)..."
docker build -f Dockerfile --target build -t $migrateImage .
if ($LASTEXITCODE -ne 0) { throw "docker build failed" }

Write-Host "Pushing $migrateImage ..."
aws ecr get-login-password --region $Region | docker login --username AWS --password-stdin $registry
docker push $migrateImage
if ($LASTEXITCODE -ne 0) { throw "docker push failed" }

$executionRoleArn = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-EcsTaskExecutionRoleArn'].Value" `
  --output text
$taskRoleArn = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-EcsTaskRoleArn'].Value" `
  --output text
$subnet1 = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-PrivateSubnet1Id'].Value" `
  --output text
$subnet2 = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-PrivateSubnet2Id'].Value" `
  --output text
$ecsSg = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-EcsSecurityGroupId'].Value" `
  --output text
$logGroup = aws cloudformation list-exports `
  --region $Region `
  --query "Exports[?Name=='${ProjectName}-AppLogGroupName'].Value" `
  --output text

$taskDefFile = Join-Path $env:TEMP "fm-migrate-taskdef.json"
$taskDefJson = @{
  family                  = "$ProjectName-migrate"
  networkMode             = "awsvpc"
  requiresCompatibilities = @("FARGATE")
  cpu                     = "512"
  memory                  = "1024"
  executionRoleArn        = $executionRoleArn
  taskRoleArn             = $taskRoleArn
  containerDefinitions    = @(
    @{
      name      = "migrate"
      image     = $migrateImage
      essential = $true
      command   = @("yarn", "prisma", "db", "push", "--accept-data-loss")
      environment = @(
        @{ name = "DATABASE_URL"; value = $databaseUrl }
      )
      logConfiguration = @{
        logDriver = "awslogs"
        options   = @{
          "awslogs-group"         = $logGroup
          "awslogs-region"        = $Region
          "awslogs-stream-prefix" = "migrate"
        }
      }
    }
  )
} | ConvertTo-Json -Depth 10 -Compress
[System.IO.File]::WriteAllText($taskDefFile, $taskDefJson, [System.Text.UTF8Encoding]::new($false))

if (-not $executionRoleArn -or -not $subnet1) {
  throw "Missing CloudFormation exports. Deploy IAM + VPC stacks first."
}

Write-Host "Registering task definition..."
$taskDefArn = aws ecs register-task-definition `
  --cli-input-json "file://$($taskDefFile.Replace('\','/'))" `
  --region $Region `
  --query "taskDefinition.taskDefinitionArn" `
  --output text

Write-Host "Starting one-off migrate task..."
$taskArn = aws ecs run-task `
  --cluster $Cluster `
  --launch-type FARGATE `
  --task-definition $taskDefArn `
  --network-configuration "awsvpcConfiguration={subnets=[$subnet1,$subnet2],securityGroups=[$ecsSg],assignPublicIp=DISABLED}" `
  --region $Region `
  --query "tasks[0].taskArn" `
  --output text

Write-Host "Task: $taskArn"
Write-Host "Waiting for task to stop (up to 10 min)..."
aws ecs wait tasks-stopped --cluster $Cluster --tasks $taskArn --region $Region

$exitCode = aws ecs describe-tasks `
  --cluster $Cluster `
  --tasks $taskArn `
  --region $Region `
  --query "tasks[0].containers[0].exitCode" `
  --output text

if ($exitCode -ne "0") {
  Write-Host "Migrate failed. Logs:"
  Write-Host "  aws logs tail $logGroup --log-stream-names migrate/migrate/$($taskArn.Split('/')[-1]) --region $Region --since 30m"
  Write-Host "  aws logs tail $logGroup --region $Region --since 30m --filter-pattern migrate"
  throw "prisma db push exited with code $exitCode"
}

Write-Host "RDS schema is in sync. Test: curl.exe -sS https://flatmatesettle.online/api/health"
