@echo off
chcp 65001 >nul
cd /d "%~dp0"

set "GIT=d:\学习汇报\软著2025.1.2\软著申请材料_2026-07-07\dev-tools\git\cmd\git.exe"
if not exist "%GIT%" set "GIT=git"

echo.
echo === Push main to Gitee (for EdgeOne) ===
echo Repo: https://gitee.com/zzz111hhh/smart-campus-navigation-system
echo.
echo Create a private token first (check projects):
echo   https://gitee.com/profile/personal_access_tokens
echo.
set /p GITEE_USER=Gitee username [zzz111hhh]: 
if "%GITEE_USER%"=="" set "GITEE_USER=zzz111hhh"
set /p GITEE_TOKEN=Paste private token: 
if "%GITEE_TOKEN%"=="" (
  echo No token, cancelled.
  pause
  exit /b 1
)

"%GIT%" remote remove gitee 2>nul
"%GIT%" remote add gitee "https://%GITEE_USER%:%GITEE_TOKEN%@gitee.com/zzz111hhh/smart-campus-navigation-system.git"
"%GIT%" push -u gitee main
set ERR=%ERRORLEVEL%
"%GIT%" remote set-url gitee https://gitee.com/zzz111hhh/smart-campus-navigation-system.git

if %ERR% neq 0 (
  echo.
  echo Push failed. Or sync from GitHub on Gitee website.
  pause
  exit /b %ERR%
)

echo.
echo OK. Next: EdgeOne import this Gitee repo.
echo Build: npm run build
echo Output: dist
pause
