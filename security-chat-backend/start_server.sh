#!/bin/bash

echo "正在启动AI智能问答后端服务..."
echo ""

# 检查Python是否安装
if ! command -v python3 &> /dev/null; then
    echo "错误: 未检测到Python，请安装Python 3.7+"
    exit 1
fi

# 检查并安装所有依赖
echo "检查并安装依赖..."

# 检查requirements.txt文件是否存在
if [ ! -f "requirements.txt" ]; then
    echo "错误: 未找到requirements.txt文件"
    exit 1
fi

# 安装所有依赖
pip3 install -r requirements.txt
if [ $? -ne 0 ]; then
    echo "错误: 依赖安装失败"
    exit 1
fi

echo "所有依赖已安装"
echo ""

# 启动服务器
echo "启动服务器..."
echo "服务将在 http://localhost:8001 上运行"
echo "本地IP地址: "
# 获取本机IP地址（适用于大多数Linux系统）
ip=$(hostname -I | awk '{print $1}')
if [ ! -z "$ip" ]; then
    echo "http://$ip:8001 （用于真机调试）"
fi
echo ""
echo "按Ctrl+C可停止服务器"
echo ""
uvicorn main:app --reload --host 0.0.0.0 --port 8001