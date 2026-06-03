param(
  [string]$Message = "update blog",
  [string]$Server = "myserver",
  [switch]$SkipServer,
  [switch]$ForcePush
)

$ErrorActionPreference = "Stop"
$Root = $PSScriptRoot
$Public = Join-Path $Root "public"

function Invoke-Step($Title, [scriptblock]$Action) {
  Write-Host "`n==> $Title" -ForegroundColor Cyan
  & $Action
}

function Invoke-Native($File, [string[]]$Arguments) {
  & $File @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "$File $($Arguments -join ' ') failed with exit code $LASTEXITCODE"
  }
}

Invoke-Step "Prepare generated output" {
  if (-not (Test-Path -LiteralPath $Public)) {
    New-Item -ItemType Directory -Path $Public | Out-Null
  }
  Get-ChildItem -Force -LiteralPath $Public | Remove-Item -Recurse -Force
  $db = Join-Path $Root "db.json"
  if (Test-Path -LiteralPath $db) { Remove-Item -Force -LiteralPath $db }
}

Invoke-Step "Generate static site" {
  Set-Location -LiteralPath $Root
  Invoke-Native hexo @("generate")
}

Invoke-Step "Commit and push repository" {
  Set-Location -LiteralPath $Root
  Invoke-Native git @("add", "-A")
  $changes = git status --porcelain
  if ($changes) {
    Invoke-Native git @("commit", "-m", $Message)
  } else {
    Write-Host "No changes to commit."
  }
  if ($ForcePush) {
    Invoke-Native git @("push", "-u", "--force-with-lease", "origin", "main")
  } else {
    Invoke-Native git @("push", "-u", "origin", "main")
  }
}

if (-not $SkipServer) {
  Invoke-Step "Deploy server" {
    $Archive = Join-Path $env:TEMP "toneblog-public.tar.gz"
    if (Test-Path -LiteralPath $Archive) { Remove-Item -Force -LiteralPath $Archive }
    Invoke-Native tar @("-czf", $Archive, "-C", $Public, ".")
    Invoke-Native scp @($Archive, "${Server}:/tmp/toneblog-public.tar.gz")
    ssh $Server "docker cp /tmp/toneblog-public.tar.gz mynginx:/tmp/toneblog-public.tar.gz && docker exec mynginx sh -lc 'cd /home/rjt/public && find . -mindepth 1 -maxdepth 1 -exec rm -rf -- {} + && tar -xzf /tmp/toneblog-public.tar.gz -C /home/rjt/public && chown -R rjt:rjt /home/rjt/public'"
    if ($LASTEXITCODE -ne 0) { throw "Server deploy failed with exit code $LASTEXITCODE" }
  }
}

Write-Host "`nDone." -ForegroundColor Green
