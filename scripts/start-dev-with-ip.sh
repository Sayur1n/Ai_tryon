#!/bin/bash

# 获取本机 IP 地址
IP_ADDRESS=$(hostname -I | awk '{print $1}')

# 设置环境变量
export NEXT_PUBLIC_BASE_URL="http://$IP_ADDRESS:3000"

echo "Starting development server with IP: $IP_ADDRESS"
echo "Base URL: $NEXT_PUBLIC_BASE_URL"

# 启动开发服务器
pnpm dev 