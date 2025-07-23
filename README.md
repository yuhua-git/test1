# 安全管理微信小程序

这是一个安全管理微信小程序，包含安全态势感知、安全知识、项目监控和AI智能问答等功能。

## 功能特点

- 安全态势感知：展示安全评分、风险预警和安全资产
- 安全知识：提供安全相关的新闻和文章
- 项目监控：跟踪安全相关项目的进度
- AI智能问答：基于大语言模型的安全知识问答功能

## 如何使用AI智能问答功能

### 1. 启动后端服务

在使用AI智能问答功能前，需要先启动后端服务：

#### Windows系统

1. 进入后端目录：`security-chat-backend`
2. 双击运行 `start_server.bat`

#### Linux/Mac系统

1. 进入后端目录：`security-chat-backend`
2. 添加执行权限：`chmod +x start_server.sh`
3. 运行脚本：`./start_server.sh`

### 2. 配置小程序

如果后端服务不是运行在本地或端口有变化，需要修改API地址：

1. 打开 `app.js` 文件
2. 修改 `globalData` 中的 `apiBaseUrl` 为实际的后端服务地址

```javascript
globalData: {
  userInfo: null,
  apiBaseUrl: 'http://your-server-address:8000', // 修改为实际地址
  apiTimeout: 10000
}
```

### 3. 使用AI问答

1. 在小程序首页找到「AI智能问答」模块
2. 可以点击预设的问题，或者在输入框中输入自定义问题
3. 点击「发送」按钮获取AI回答

## 开发说明

### 后端API

后端使用FastAPI框架开发，提供以下API：

- `POST /chat`：AI聊天接口
- `GET /`：服务状态检查

### 前端组件

- 使用微信小程序原生开发
- 聊天界面支持历史记录和加载动画
- 工具函数封装在 `utils/util.js` 中

## 测试

可以使用提供的测试脚本测试后端API：

```bash
python security-chat-backend/test_api.py "你的测试问题"
```

## 注意事项

- 后端服务默认使用8000端口，确保该端口未被占用
- 在真机调试时，需要将API地址修改为可访问的IP地址
- 本项目中的LLM配置需要根据实际情况修改