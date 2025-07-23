# 微信小程序调用本地服务指南

本文档提供了关于如何正确配置微信小程序以调用本地后端服务的详细说明。

## 问题描述

微信小程序在调用本地服务时可能会遇到以下问题：

1. 网络请求失败
2. 域名不合法的错误
3. 跨域请求被拒绝(CORS错误)

## 解决方案

### 1. 后端服务配置

后端服务已经添加了CORS支持，允许跨域请求。相关代码在`security-chat-backend/main.py`中：

```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)
```

### 2. 微信开发者工具配置

在微信开发者工具中，您需要：

1. 打开项目设置（点击工具栏上的「详情」按钮）
2. 在「本地设置」中，**关闭**「不校验合法域名、web-view（业务域名）、TLS 版本以及 HTTPS 证书」选项

![微信开发者工具设置](https://res.wx.qq.com/wxdoc/dist/assets/img/un-valid-domain.21828b0c.png)

### 3. API基础URL配置

在`app.js`文件中，根据您的使用场景配置正确的API基础URL：

```javascript
globalData: {
  // 1. 开发工具中调试：使用localhost
  apiBaseUrl: 'http://localhost:8001',
  
  // 2. 真机调试：使用本机的局域网IP地址
  // apiBaseUrl: 'http://192.168.x.x:8001', // 替换为您的本机IP
}
```

### 4. 检查网络连接

我们提供了一个网络连接检查工具，帮助您诊断连接问题：

1. 进入后端目录：`cd security-chat-backend`
2. 运行检查工具：`python check_network.py`

该工具将检查：
- 本地服务器是否正在运行
- 端口是否开放
- API是否可访问
- 提供适用于开发工具和真机调试的URL

### 5. 真机调试注意事项

如果您需要在真机上调试：

1. 确保手机和电脑在同一网络中
2. 使用电脑的局域网IP地址（而非localhost）
3. 确保电脑防火墙允许8001端口的访问
4. 在`app.js`中修改`apiBaseUrl`为您的本机IP地址

## 常见问题

### Q: 为什么我的请求总是失败？

**A:** 可能的原因：
- 后端服务未启动
- API基础URL配置错误
- 网络连接问题
- CORS配置问题

运行`check_network.py`工具可以帮助诊断具体原因。

### Q: 如何获取我的本机IP地址？

**A:** 运行后端服务的启动脚本（`start_server.bat`或`start_server.sh`）会显示您的本机IP地址。

### Q: 生产环境应该如何配置？

**A:** 在生产环境中：
1. 使用HTTPS协议
2. 在微信公众平台后台配置合法域名
3. 限制CORS的`allow_origins`为您的应用域名
4. 添加适当的安全措施，如API认证

## 其他资源

- [微信小程序开发文档 - 网络请求](https://developers.weixin.qq.com/miniprogram/dev/api/network/request/wx.request.html)
- [FastAPI CORS文档](https://fastapi.tiangolo.com/tutorial/cors/)