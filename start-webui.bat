@echo off
echo Starting Career-Ops Web UI...

REM Navigate to the webui directory relative to the script location
cd /d "%~dp0webui"

REM Ensure dependencies are installed just in case
IF NOT EXIST "node_modules\" (
  echo Installing backend dependencies...
  npm install
)

IF NOT EXIST "ui\node_modules\" (
  echo Installing frontend dependencies...
  cd ui
  npm install
  cd ..
)

REM Run the dev server
npm run dev
pause
