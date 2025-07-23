#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
项目API测试脚本
用于测试项目相关的API接口
"""

import requests
import json
from datetime import datetime

# API配置
API_BASE_URL = "http://localhost:8001"
API_TIMEOUT = 30

def test_api_endpoint(url, method="GET", data=None, description=""):
    """测试API端点"""
    print(f"\n{'='*60}")
    print(f"测试: {description}")
    print(f"URL: {url}")
    print(f"方法: {method}")
    
    try:
        if method == "GET":
            response = requests.get(url, timeout=API_TIMEOUT)
        elif method == "POST":
            response = requests.post(url, json=data, timeout=API_TIMEOUT)
        else:
            print(f"❌ 不支持的HTTP方法: {method}")
            return False
        
        print(f"状态码: {response.status_code}")
        
        if response.status_code == 200:
            result = response.json()
            print("✅ 请求成功!")
            print("响应数据:")
            print(json.dumps(result, indent=2, ensure_ascii=False))
            return True
        else:
            print(f"❌ 请求失败: HTTP {response.status_code}")
            print(f"响应内容: {response.text}")
            return False
            
    except requests.exceptions.ConnectionError:
        print(f"❌ 连接错误: 无法连接到服务器 {API_BASE_URL}")
        print("请确保后端服务器已启动")
        return False
    except requests.exceptions.Timeout:
        print(f"❌ 请求超时: 超过 {API_TIMEOUT} 秒")
        return False
    except Exception as e:
        print(f"❌ 测试过程中出现错误: {str(e)}")
        return False

def test_all_project_apis():
    """测试所有项目相关的API"""
    print("\n🚀 开始测试项目API接口...")
    print(f"测试时间: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    test_results = []
    
    # 1. 测试根路径
    result = test_api_endpoint(
        f"{API_BASE_URL}/",
        description="根路径 - 服务状态检查"
    )
    test_results.append(("根路径", result))
    
    # 2. 测试健康检查
    result = test_api_endpoint(
        f"{API_BASE_URL}/health",
        description="健康检查 - 数据库连接状态"
    )
    test_results.append(("健康检查", result))
    
    # 3. 测试项目列表（无参数）
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/list",
        description="项目列表 - 获取所有项目"
    )
    test_results.append(("项目列表", result))
    
    # 4. 测试项目列表（带分页参数）
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/list?page=1&page_size=5",
        description="项目列表 - 分页查询"
    )
    test_results.append(("项目列表分页", result))
    
    # 5. 测试项目列表（带搜索关键词）
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/list?keyword=安全测评",
        description="项目列表 - 关键词搜索"
    )
    test_results.append(("项目搜索", result))
    
    # 6. 测试项目列表（按状态筛选）
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/list?status=evaluating",
        description="项目列表 - 状态筛选"
    )
    test_results.append(("项目状态筛选", result))
    
    # 7. 测试项目详情
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/1",
        description="项目详情 - 获取ID为1的项目"
    )
    test_results.append(("项目详情", result))
    
    # 8. 测试项目统计
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/stats/overview",
        description="项目统计 - 获取项目概览统计"
    )
    test_results.append(("项目统计", result))
    
    # 9. 测试最近更新
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/recent/updates?limit=3",
        description="最近更新 - 获取最近更新的项目"
    )
    test_results.append(("最近更新", result))
    
    # 10. 测试不存在的项目详情
    result = test_api_endpoint(
        f"{API_BASE_URL}/api/projects/999",
        description="项目详情 - 测试不存在的项目ID"
    )
    test_results.append(("不存在项目", result))
    
    # 输出测试总结
    print(f"\n{'='*60}")
    print("🎯 测试总结")
    print(f"{'='*60}")
    
    passed = 0
    failed = 0
    
    for test_name, success in test_results:
        status = "✅ 通过" if success else "❌ 失败"
        print(f"{test_name:<20} {status}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n总计: {len(test_results)} 个测试")
    print(f"通过: {passed} 个")
    print(f"失败: {failed} 个")
    print(f"成功率: {(passed/len(test_results)*100):.1f}%")
    
    if failed == 0:
        print("\n🎉 所有测试都通过了！")
    else:
        print(f"\n⚠️  有 {failed} 个测试失败，请检查服务器状态和数据库连接")
    
    return failed == 0

def test_miniprogram_compatibility():
    """测试小程序兼容性"""
    print(f"\n{'='*60}")
    print("📱 测试小程序兼容性")
    print(f"{'='*60}")
    
    # 模拟小程序的请求参数
    miniprogram_params = {
        "page": 1,
        "page_size": 20,
        "keyword": "安全"
    }
    
    query_string = "&".join([f"{k}={v}" for k, v in miniprogram_params.items()])
    url = f"{API_BASE_URL}/api/projects/list?{query_string}"
    
    result = test_api_endpoint(
        url,
        description="小程序项目列表请求 - 模拟小程序调用"
    )
    
    if result:
        print("\n✅ 小程序兼容性测试通过")
        print("小程序可以正常调用项目API接口")
    else:
        print("\n❌ 小程序兼容性测试失败")
        print("请检查API接口和CORS配置")
    
    return result

def main():
    """主函数"""
    print("\n🔧 项目API测试工具")
    print("=" * 60)
    
    # 测试所有API
    api_success = test_all_project_apis()
    
    # 测试小程序兼容性
    miniprogram_success = test_miniprogram_compatibility()
    
    print(f"\n{'='*60}")
    print("🏁 最终结果")
    print(f"{'='*60}")
    
    if api_success and miniprogram_success:
        print("🎉 所有测试都通过！项目API已准备就绪")
        print("\n📋 使用说明:")
        print("1. 确保MySQL数据库已启动并配置正确")
        print("2. 运行 'python init_data.py' 初始化示例数据")
        print("3. 启动FastAPI服务器: 'uvicorn main:app --host 0.0.0.0 --port 8001 --reload'")
        print("4. 在小程序中测试项目功能")
    else:
        print("❌ 部分测试失败，请检查配置")
        print("\n🔍 故障排除:")
        print("1. 检查FastAPI服务器是否正在运行")
        print("2. 检查MySQL数据库连接")
        print("3. 检查防火墙和端口设置")
        print("4. 查看服务器日志获取详细错误信息")

if __name__ == "__main__":
    main()