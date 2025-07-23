#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
网络连接检查工具
用于检查微信小程序与后端服务器之间的网络连接
"""

import socket
import requests
import sys
import platform
import subprocess

def check_port(host, port):
    """检查指定主机的端口是否开放"""
    try:
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(2)  # 设置超时时间为2秒
        result = sock.connect_ex((host, port))
        sock.close()
        return result == 0
    except Exception as e:
        print(f"检查端口时出错: {e}")
        return False

def get_local_ip():
    """获取本机IP地址"""
    try:
        # 创建一个临时socket连接来获取本机IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        ip = s.getsockname()[0]
        s.close()
        return ip
    except Exception:
        return "无法获取本机IP"

def ping_host(host):
    """Ping指定主机"""
    param = "-n" if platform.system().lower() == "windows" else "-c"
    command = ["ping", param, "4", host]
    try:
        output = subprocess.check_output(command).decode("utf-8")
        return True, output
    except subprocess.CalledProcessError:
        return False, "Ping失败"

def check_api(url):
    """检查API是否可访问"""
    try:
        response = requests.get(url, timeout=5)
        return response.status_code == 200, response.text
    except requests.RequestException as e:
        return False, str(e)

def main():
    print("===== 网络连接检查工具 =====")
    print("此工具用于检查微信小程序与后端服务器之间的网络连接\n")
    
    # 获取本机信息
    local_ip = get_local_ip()
    print(f"本机IP地址: {local_ip}")
    
    # 检查本地服务器
    print("\n检查本地服务器...")
    localhost_port_open = check_port("localhost", 8001)
    print(f"localhost:8001 端口状态: {'开放' if localhost_port_open else '关闭'}")
    
    # 检查本机IP服务器
    if local_ip != "无法获取本机IP":
        print(f"\n检查本机IP服务器...")
        local_ip_port_open = check_port(local_ip, 8001)
        print(f"{local_ip}:8001 端口状态: {'开放' if local_ip_port_open else '关闭'}")
    
    # 检查API
    print("\n检查API可访问性...")
    localhost_api_ok, localhost_api_result = check_api("http://localhost:8001")
    print(f"localhost API: {'可访问' if localhost_api_ok else '不可访问'}")
    
    if local_ip != "无法获取本机IP":
        local_ip_api_ok, local_ip_api_result = check_api(f"http://{local_ip}:8001")
        print(f"本机IP API: {'可访问' if local_ip_api_ok else '不可访问'}")
    
    # 提供建议
    print("\n===== 诊断结果 =====")
    if not localhost_port_open:
        print("❌ 本地服务器未运行，请启动后端服务")
    elif not localhost_api_ok:
        print("❌ 本地服务器运行中但API不可访问，请检查服务器日志")
    elif local_ip != "无法获取本机IP" and not local_ip_port_open:
        print(f"❌ 本机IP({local_ip})端口未开放，可能是防火墙阻止了访问")
        print("建议: 检查防火墙设置，允许8001端口的访问")
    elif local_ip != "无法获取本机IP" and not local_ip_api_ok:
        print(f"❌ 本机IP({local_ip})可以连接但API不可访问")
        print("建议: 检查服务器是否绑定到0.0.0.0而不是仅localhost")
    else:
        print("✅ 服务器运行正常!")
        print(f"微信小程序可以使用以下地址连接后端:")
        print(f"- 开发工具中: http://localhost:8001")
        if local_ip != "无法获取本机IP":
            print(f"- 真机调试中: http://{local_ip}:8001")
    
    print("\n===== 微信小程序配置建议 =====")
    print("1. 在app.js中设置正确的apiBaseUrl:")
    print("   - 开发工具中使用: 'http://localhost:8001'")
    if local_ip != "无法获取本机IP":
        print(f"   - 真机调试中使用: 'http://{local_ip}:8001'")
    print("2. 在微信开发者工具中,关闭'不校验合法域名'选项")
    print("3. 确保手机和电脑在同一网络中进行真机调试")

if __name__ == "__main__":
    main()