@echo off
setlocal
set "ROOT=%~dp0.."
set "PATH=%~dp0node-v22.12.0-win-x64;%PATH%"
cd /d "%ROOT%\miniprogram"
call npm.cmd %*
endlocal
