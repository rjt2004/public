param(
  [string]$Message = "update blog",
  [string]$Server = "myserver",
  [switch]$SkipSourcePush,
  [switch]$SkipServer
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
  if (Test-Path -LiteralPath (Join-Path $Public ".git")) {
    Invoke-Native git @("-C", $Public, "reset", "--hard")
    Invoke-Native git @("-C", $Public, "clean", "-fd")
  }
  $db = Join-Path $Root "db.json"
  if (Test-Path -LiteralPath $db) { Remove-Item -Force -LiteralPath $db }
}

Invoke-Step "Generate static site" {
  Set-Location -LiteralPath $Root
  Invoke-Native hexo @("generate")
}

Invoke-Step "Commit source repository" {
  Set-Location -LiteralPath $Root
  Invoke-Native git @("add", "-A")
  $sourceChanges = git status --porcelain
  if ($sourceChanges) {
    Invoke-Native git @("commit", "-m", "$Message (source)")
  } else {
    Write-Host "No source changes to commit."
  }
  if (-not $SkipSourcePush) {
    $sourceRemote = git remote
    if ($sourceRemote -contains "origin") {
      Invoke-Native git @("push", "-u", "origin", "source")
    } else {
      Write-Host "Source repository has no origin remote; skipped source push." -ForegroundColor Yellow
    }
  }
}

Invoke-Step "Commit and push public repository" {
  Set-Location -LiteralPath $Public
  Invoke-Native git @("add", "-A")
  $publicChanges = git status --porcelain
  if ($publicChanges) {
    Invoke-Native git @("commit", "-m", $Message)
  } else {
    Write-Host "No public changes to commit."
  }
  Invoke-Native git @("push", "origin", "main")
}

if (-not $SkipServer) {
  Invoke-Step "Deploy server" {
    ssh $Server "docker exec -u rjt mynginx sh -lc 'cd /home/rjt/public && git pull --ff-only'"
    if ($LASTEXITCODE -ne 0) { throw "Server deploy failed with exit code $LASTEXITCODE" }
  }
}

Write-Host "`nDone." -ForegroundColor Green
