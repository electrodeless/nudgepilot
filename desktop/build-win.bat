@echo off
setlocal enabledelayedexpansion

cd /d "%~dp0"

if not exist package.json (
  echo [错误] 未找到 package.json，請確認腳本與桌面殼項目位於同一路徑。
  pause
  exit /b 1
)

echo ==^> 檢查 Node.js 與 npm...
where node >nul 2>nul || (
  echo [错误] 未檢測到 Node.js。請先安裝 https://nodejs.org/ 並重新執行。
  pause
  exit /b 1
)

where npm >nul 2>nul || (
  echo [错误] 未檢測到 npm。請確認 Node.js 已正確安裝。
  pause
  exit /b 1
)

echo ==^> 安裝/更新依賴...
if exist node_modules (
  call npm install --no-audit --no-fund || goto :error
) else (
  call npm install || goto :error
)

echo ==^> 構建 Windows 發行包...
call npm run build:win || goto :error

echo.
echo ✅ 已完成構建，請查看 dist\ 目錄中的安裝包與便攜版可執行文件。
pause
exit /b 0

:error
echo.
echo ❌ 構建失敗，請檢查上述日誌後重試。
pause
exit /b 1
