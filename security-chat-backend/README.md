# AI智能问答后端服务

这是一个基于FastAPI开发的AI智能问答后端服务，用于为微信小程序提供AI聊天功能。

## 功能特点

- 基于FastAPI构建的高性能API服务
- 支持与大语言模型(LLM)的集成
- 简单的聊天接口设计
- 易于部署和扩展

## 系统要求

- Python 3.7+
- FastAPI
- Uvicorn
- Requests

## 快速开始

### 安装依赖

```bash
pip install fastapi uvicorn requests
```

### 配置

在`main.py`中配置您的LLM服务：

```python
# LLM 配置
LLM_URL = "http://your-llm-service-url"
LLM_NAME = "your-model-name"
LLM_API_KEY = "your-api-key"
```

### 启动服务

#### Windows

双击`start_server.bat`或在命令行中运行：

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8001
```

#### Linux/Mac

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

服务将在`http://localhost:8001`上运行。

## API接口

### 聊天接口

- **URL**: `/chat`
- **方法**: POST
- **请求体**:
  ```json
  {
    "message": "用户的问题",
    "session_id": "可选的会话ID"
  }
  ```
- **响应**:
  ```json
  {
    "response": "AI的回答"
  }
  ```

## 与微信小程序集成

在微信小程序中，您可以使用以下代码调用此API：

```javascript
wx.request({
  url: 'http://your-server-url:8001/chat',
  method: 'POST',
  data: {
    message: '用户问题',
    session_id: '可选的会话ID'
  },
  success: function(res) {
    console.log('AI回答:', res.data.response)
  }
})
```

## 注意事项

### CORS配置

本服务已配置CORS中间件，允许跨域请求。在生产环境中，您应该限制允许的来源：

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-domain.com"],  # 限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 微信小程序调用本地服务

1. **开发工具中调试**：
   - 在微信开发者工具中，确保关闭「详情 > 本地设置 > 不校验合法域名...」选项
   - 使用`localhost`或`127.0.0.1`作为API基础URL

2. **真机调试**：
   - 使用本机的局域网IP地址（如`192.168.x.x`）替换`localhost`
   - 确保手机和电脑在同一网络中
   - 在`app.js`中修改`apiBaseUrl`为您的本机IP地址

3. **其他注意事项**：
   - 在生产环境中，请确保添加适当的安全措施，如API认证和HTTPS
   - 根据您的需求调整LLM参数，如temperature和max_tokens
   - 考虑添加速率限制以防止API滥用

## 许可证

MIT