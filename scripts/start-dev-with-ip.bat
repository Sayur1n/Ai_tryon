@echo off

REM 获取本机 IP 地址
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /r /c:"IPv4"') do (
    set IP_ADDRESS=%%a
    goto :found_ip
)
:found_ip

REM 去除空格
set IP_ADDRESS=%IP_ADDRESS: =%

REM 设置环境变量
set NEXT_PUBLIC_BASE_URL=http://%IP_ADDRESS%:3000

echo Starting development server with IP: %IP_ADDRESS%
echo Base URL: %NEXT_PUBLIC_BASE_URL%

REM 启动开发服务器
pnpm dev 