@echo off
call "%~dp0start-backend.bat"
call "%~dp0start-web.bat"
timeout /t 4 >nul
start "" "http://localhost:5173"
