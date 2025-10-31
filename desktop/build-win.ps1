param(
  [switch]$SkipInstall
)

$ErrorActionPreference = 'Stop'

Write-Host "==> 切換到桌面殼目錄" -ForegroundColor Cyan
Set-Location -Path $PSScriptRoot

if (!(Test-Path 'package.json')) {
  Write-Host '[错误] 未找到 package.json，請確保腳本位於 desktop 目錄內。' -ForegroundColor Red
  exit 1
}

if (-not $SkipInstall) {
  Write-Host "==> 安裝/更新依賴" -ForegroundColor Cyan
  npm install --no-audit --no-fund
}

Write-Host "==> 構建 Windows 發行包" -ForegroundColor Cyan
npm run build:win

Write-Host "`n✅ 構建完成。安裝器與便攜版已輸出至 dist\\ 目錄。" -ForegroundColor Green
