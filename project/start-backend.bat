@echo off
setlocal
set "ROOT=%~dp0"
if not defined JAVA_HOME set "JAVA_HOME=C:\Program Files\Zulu\zulu-25"
cd /d "%ROOT%server"
if not exist "target\campus-suda-1.0.0.jar" (
  set "MAVEN_HOME=%ROOT%tools\apache-maven-3.9.9"
  call "%MAVEN_HOME%\bin\mvn.cmd" -q -DskipTests package
)
start "CampusSudaAPI" /min "%JAVA_HOME%\bin\java.exe" -jar "target\campus-suda-1.0.0.jar"
endlocal
