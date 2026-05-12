#!/bin/bash
# --- KaleidoFire | 万华烟火 Launcher ---

# 自动切换到当前脚本所在目录
cd "$(dirname "$0")"

# 检查 Node.js 是否安装
if ! command -v node &> /dev/null
then
    echo "Error: Node.js is not installed. Please install it from https://nodejs.org/"
    exit
fi

# 检查依赖
if [ ! -d "node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    npm install
fi

# 启动 Vite 并自动打开浏览器
echo "------------------------------------------------"
echo "        KALEIDOFIRE  |  万华烟火               "
echo "------------------------------------------------"
echo "正在启动本地模拟器 (默认端口: 5196)..."
npm run dev -- --open
