@echo off
setlocal
cd /d "%~dp0"
title ETOS Local Development Server
powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File "%~dp0etos-server.ps1"
if errorlevel 1 (
  echo.
  echo ETOS could not start. Please leave this window open and send a screenshot of the error.
  pause
)
