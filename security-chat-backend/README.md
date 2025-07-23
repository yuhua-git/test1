# 安全管理系统后端服务

这是一个基于FastAPI开发的安全管理系统后端服务，为微信小程序提供AI智能问答和项目信息管理功能。

## 服务架构

系统采用微服务架构，分为两个独立的API服务：
- **智能问答API服务**：运行在8001端口，提供AI聊天功能
- **项目管理API服务**：运行在8002端口，提供项目信息管理功能

## 功能特点

- 基于FastAPI构建的高性能API服务
- 支持与大语言模型(LLM)的集成
- 完整的项目信息管理系统
- MySQL数据库集成
- RESTful API设计
- 易于部署和扩展

## 系统要求

- Python 3.7+
- FastAPI
- Uvicorn
- SQLAlchemy
- MySQL 8.0+
- PyMySQL
- Requests

## 快速开始

### 安装依赖

```bash
pip install -r requirements.txt
```

或手动安装：

```bash
pip install fastapi uvicorn sqlalchemy pymysql mysql-connector-python requests
```

### 配置

#### 1. 数据库配置

参考 `DATABASE_SETUP.md` 文件配置MySQL数据库。

#### 2. LLM服务配置

在`main.py`中配置您的LLM服务：

```python
# LLM 配置
LLM_URL = "http://your-llm-service-url"
LLM_NAME = "your-model-name"
LLM_API_KEY = "your-api-key"
```

#### 3. 环境变量配置

创建 `.env` 文件：
```bash
DATABASE_URL=mysql+pymysql://root:password@localhost:3306/security_project_db
```

### 启动服务

#### 方法一：同时启动两个服务（推荐）

```bash
./start_both_servers.sh
```

这将同时启动：
- 智能问答API服务：`http://localhost:8001`
- 项目管理API服务：`http://localhost:8002`

#### 方法二：分别启动服务

```bash
# 启动智能问答API服务（8001端口）
uvicorn main:app --reload --host 0.0.0.0 --port 8001

# 启动项目管理API服务（8002端口）
uvicorn project_server:app --reload --host 0.0.0.0 --port 8002
```

#### 方法三：使用旧版启动脚本

```bash
python start_project_server.py
```

## API接口

### 1. AI聊天接口

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

### 2. 项目管理接口

#### 获取项目列表
- **URL**: `/api/projects/list`
- **方法**: GET
- **参数**: `page`, `page_size`, `keyword`, `status`

#### 获取项目详情
- **URL**: `/api/projects/{project_id}`
- **方法**: GET

#### 项目统计
- **URL**: `/api/projects/stats/overview`
- **方法**: GET

#### 最近更新
- **URL**: `/api/projects/recent/updates`
- **方法**: GET

详细API文档请参考 `PROJECT_API_GUIDE.md`。

## 与微信小程序集成

### AI聊天功能

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

### 项目信息功能

```javascript
// 获取项目列表（注意使用8002端口）
wx.request({
  url: 'http://your-server-url:8002/api/projects/list',
  method: 'GET',
  success: function(res) {
    console.log('项目列表:', res.data.projects)
  }
})
```

## 测试

### API测试

```bash
# 测试所有项目API接口
python test_project_api.py

# 测试AI聊天接口
python test_api.py
```

### 健康检查

- 智能问答服务：`http://localhost:8001/health`
- 项目管理服务：`http://localhost:8002/health`

## 文档

- `PROJECT_API_GUIDE.md` - 项目API详细文档
- `DATABASE_SETUP.md` - 数据库配置说明
- `http://localhost:8001/docs` - 自动生成的API文档

## 注意事项

### CORS配置

本服务已配置CORS中间件，允许跨域请求。在生产环境中，您应该限制允许的来源。

### 微信小程序调用本地服务

1. **开发工具中调试**：使用`localhost`
2. **真机调试**：使用本机局域网IP地址
3. **生产环境**：使用HTTPS域名

### 数据库

- 确保MySQL服务正在运行
- 定期备份数据库
- 监控数据库性能

### 安全

- 在生产环境中添加API认证
- 使用HTTPS协议
- 限制API访问频率

## 许可证

MIT