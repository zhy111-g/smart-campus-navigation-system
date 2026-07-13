@echo off
chcp 65001 >nul
title 纯前端版 - 校园路径导航 (GitHub Pages)
call "%~dp0..\dev-tools\env.bat"

cd /d "%~dp0"

if not exist "%NODE_HOME%\node.exe" (
    echo [错误] 未找到 Node.js，请先运行 dev-tools\1-安装开发环境.bat
    pause
    exit /b 1
)

if not exist "node_modules" (
    echo 首次运行，正在安装依赖...
    call npm install --registry=https://registry.npmmirror.com
)

echo.
echo 纯前端版（无需启动 Java 后端）
echo 启动后访问: http://localhost:8088
echo 按 Ctrl+C 可停止
echo.

call npm run serve
pause
