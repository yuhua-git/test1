#!/bin/bash

# 启动智能问答API服务器（8001端口）和项目管理API服务器（8002端口）

echo "正在启动安全管理系统服务..."
echo "智能问答API: http://localhost:8001"
echo "项目管理API: http://localhost:8002"
echo ""

# 检查端口是否被占用
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null ; then
        echo "警告: 端口 $port 已被占用"
        return 1
    fi
    return 0
}

# 检查8001端口
if ! check_port 8001; then
    echo "请先停止占用8001端口的进程"
fi

# 检查8002端口
if ! check_port 8002; then
    echo "请先停止占用8002端口的进程"
fi

echo "启动智能问答API服务器（端口8001）..."
# 在后台启动智能问答API
python3 -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload &
CHAT_PID=$!

echo "启动项目管理API服务器（端口8002）..."
# 在后台启动项目管理API
python3 -m uvicorn project_server:app --host 0.0.0.0 --port 8002 --reload &
PROJECT_PID=$!

# 等待服务启动
sleep 3

echo ""
echo "服务启动完成！"
echo "智能问答API: http://localhost:8001/chat"
echo "项目管理API: http://localhost:8002/api/projects/list"
echo ""
echo "按 Ctrl+C 停止所有服务"

# 捕获中断信号，优雅关闭服务
trap 'echo "\n正在停止服务..."; kill $CHAT_PID $PROJECT_PID; exit' INT

# 等待进程结束
wait