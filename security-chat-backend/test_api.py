import requests
import json
import sys

# 测试配置
API_URL = "http://localhost:8001/chat"
ROOT_URL = "http://localhost:8001/"

def test_chat_api(message):
    """测试聊天API"""
    print(f"\n发送问题: {message}")
    
    try:
        # 准备请求数据
        payload = {
            "message": message,
            "session_id": "test-session"
        }
        
        # 发送POST请求
        response = requests.post(API_URL, json=payload)
        
        # 检查响应状态码
        if response.status_code == 200:
            result = response.json()
            print("\n✅ API请求成功!")
            print("\nAI回答:")
            print(f"\n{result['response']}\n")
            return True
        else:
            print(f"\n❌ API请求失败: HTTP状态码 {response.status_code}")
            print(f"响应内容: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ 连接错误: 无法连接到服务器 {API_URL}")
        print("请确保后端服务器已启动")
        return False
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {str(e)}")
        return False

def test_root_api():
    """测试根路径API"""
    print("\n测试根路径 API...")
    
    try:
        # 发送GET请求
        response = requests.get(ROOT_URL)
        
        # 检查响应状态码
        if response.status_code == 200:
            result = response.json()
            print("\n✅ 根路径API请求成功!")
            print(f"响应内容: {result}")
            return True
        else:
            print(f"\n❌ 根路径API请求失败: HTTP状态码 {response.status_code}")
            print(f"响应内容: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"\n❌ 连接错误: 无法连接到服务器 {ROOT_URL}")
        print("请确保后端服务器已启动")
        return False
    except Exception as e:
        print(f"\n❌ 测试过程中出现错误: {str(e)}")
        return False

def main():
    print("===== AI智能问答API测试工具 =====\n")
    
    # 先测试根路径API
    test_root_api()
    
    # 检查命令行参数
    if len(sys.argv) > 1:
        message = " ".join(sys.argv[1:])
        test_chat_api(message)
    else:
        # 交互式测试
        while True:
            message = input("请输入问题 (输入'exit'退出): ")
            if message.lower() == 'exit':
                break
            if message.strip():
                test_chat_api(message)
            print("\n" + "-"*40)

if __name__ == "__main__":
    main()