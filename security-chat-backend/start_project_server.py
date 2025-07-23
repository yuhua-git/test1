#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目API服务器启动脚本
自动检查环境、初始化数据库并启动服务器
"""

import os
import sys
import subprocess
import time
from database import test_connection, create_tables

def check_dependencies():
    """检查依赖包是否已安装"""
    print("🔍 检查依赖包...")
    
    required_packages = [
        'fastapi',
        'uvicorn',
        'sqlalchemy',
        'pymysql',
        'mysql-connector-python',
        'requests'
    ]
    
    missing_packages = []
    
    for package in required_packages:
        try:
            __import__(package.replace('-', '_'))
            print(f"  ✅ {package}")
        except ImportError:
            print(f"  ❌ {package} (未安装)")
            missing_packages.append(package)
    
    if missing_packages:
        print(f"\n⚠️  缺少以下依赖包: {', '.join(missing_packages)}")
        print("请运行以下命令安装:")
        print(f"pip install {' '.join(missing_packages)}")
        return False
    
    print("✅ 所有依赖包已安装")
    return True

def check_database():
    """检查数据库连接"""
    print("\n🔍 检查数据库连接...")
    
    if test_connection():
        print("✅ 数据库连接成功")
        
        # 创建数据库表
        print("🔧 初始化数据库表...")
        try:
            create_tables()
            print("✅ 数据库表初始化完成")
            return True
        except Exception as e:
            print(f"❌ 数据库表初始化失败: {e}")
            return False
    else:
        print("❌ 数据库连接失败")
        print("\n🔧 数据库配置说明:")
        print("1. 确保MySQL服务已启动")
        print("2. 检查数据库连接字符串 (DATABASE_URL)")
        print("3. 确认数据库用户权限")
        print("4. 参考 DATABASE_SETUP.md 文件进行配置")
        return False

def init_sample_data():
    """初始化示例数据"""
    print("\n🔍 检查示例数据...")
    
    try:
        from init_data import create_sample_data
        create_sample_data()
        return True
    except Exception as e:
        print(f"⚠️  示例数据初始化失败: {e}")
        print("可以稍后手动运行 'python init_data.py' 创建示例数据")
        return False

def get_local_ip():
    """获取本机IP地址"""
    try:
        import socket
        # 连接到一个远程地址来获取本机IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except:
        return "localhost"

def start_server():
    """启动FastAPI服务器"""
    print("\n🚀 启动项目API服务器...")
    
    # 获取本机IP
    local_ip = get_local_ip()
    
    print(f"\n📋 服务器信息:")
    print(f"  本地访问: http://localhost:8001")
    print(f"  局域网访问: http://{local_ip}:8001")
    print(f"  API文档: http://localhost:8001/docs")
    print(f"  健康检查: http://localhost:8001/health")
    
    print(f"\n📱 小程序配置:")
    print(f"  开发工具调试: 使用 http://localhost:8001")
    print(f"  真机调试: 使用 http://{local_ip}:8001")
    print(f"  记得在 app.js 中更新 apiBaseUrl 配置")
    
    print(f"\n🔧 启动命令: uvicorn main:app --host 0.0.0.0 --port 8001 --reload")
    print("\n按 Ctrl+C 停止服务器")
    print("=" * 60)
    
    try:
        # 启动uvicorn服务器
        subprocess.run([
            sys.executable, "-m", "uvicorn", 
            "main:app", 
            "--host", "0.0.0.0", 
            "--port", "8001", 
            "--reload"
        ])
    except KeyboardInterrupt:
        print("\n\n👋 服务器已停止")
    except Exception as e:
        print(f"\n❌ 启动服务器失败: {e}")
        print("\n🔧 手动启动方法:")
        print("uvicorn main:app --host 0.0.0.0 --port 8001 --reload")

def main():
    """主函数"""
    print("\n🎯 项目API服务器启动工具")
    print("=" * 60)
    
    # 检查当前目录
    if not os.path.exists("main.py"):
        print("❌ 请在 security-chat-backend 目录下运行此脚本")
        sys.exit(1)
    
    # 1. 检查依赖包
    if not check_dependencies():
        print("\n❌ 依赖包检查失败，请先安装所需依赖")
        sys.exit(1)
    
    # 2. 检查数据库
    if not check_database():
        print("\n❌ 数据库检查失败，请先配置数据库")
        sys.exit(1)
    
    # 3. 初始化示例数据
    init_sample_data()
    
    # 4. 启动服务器
    start_server()

if __name__ == "__main__":
    main()