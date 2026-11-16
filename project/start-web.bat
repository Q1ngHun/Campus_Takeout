@echo off
setlocal
set "ROOT=%~dp0"
set "PATH=%ROOT%tools\node-v22.12.0-win-x64;%PATH%"
cd /d "%ROOT%web"
if not exist "node_modules" call npm.cmd install
start "CampusSudaWeb" /min cmd /c "npm.cmd run dev -- --host 0.0.0.0 --port 5173"
endlocal
