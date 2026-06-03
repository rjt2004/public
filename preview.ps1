param(
  [int]$Port = 4000
)

$ErrorActionPreference = "Stop"
Set-Location -LiteralPath $PSScriptRoot
Write-Host "Starting Hexo preview at http://127.0.0.1:$Port/"
hexo server -p $Port
