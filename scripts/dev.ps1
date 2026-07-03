$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot

Set-Location $repoRoot
corepack pnpm --filter @kaidon/web dev
