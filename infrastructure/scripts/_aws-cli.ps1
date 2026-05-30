# Ensures `aws` is on PATH (common issue in Cursor/VS Code terminals on Windows).
function Ensure-AwsCliOnPath {
  if (Get-Command aws -ErrorAction SilentlyContinue) {
    return
  }

  $candidates = @(
    "C:\Program Files\Amazon\AWSCLIV2",
    "$env:ProgramFiles\Amazon\AWSCLIV2",
    "${env:ProgramFiles(x86)}\Amazon\AWSCLIV2",
    "$env:LOCALAPPDATA\Programs\Amazon\AWSCLIV2"
  )

  foreach ($dir in $candidates) {
    $exe = Join-Path $dir "aws.exe"
    if (Test-Path $exe) {
      $env:Path = "$dir;$env:Path"
      Write-Host "Using AWS CLI from: $dir"
      return
    }
  }

  throw @"
AWS CLI not found. Install AWS CLI v2 for Windows:
  https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html
Then restart your terminal, or add this folder to your user PATH:
  C:\Program Files\Amazon\AWSCLIV2
"@
}
