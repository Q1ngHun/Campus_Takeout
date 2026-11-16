@echo off
setlocal
set "ROOT=%~dp0.."
if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Zulu\zulu-25"
set "MAVEN_HOME=%~dp0apache-maven-3.9.9"
cd /d "%ROOT%\server"
call "%MAVEN_HOME%\bin\mvn.cmd" %*
endlocal
