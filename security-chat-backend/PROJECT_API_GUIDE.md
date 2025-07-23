# 项目信息API接口文档

## 概述

本文档介绍了为微信小程序项目信息功能设计的FastAPI接口系统。该系统提供了完整的项目进度管理功能，包括项目列表查询、项目详情获取、项目统计等功能。

## 系统架构

```
微信小程序 ←→ FastAPI服务器 ←→ MySQL数据库
```

- **前端**: 微信小程序 (pages/project/)
- **后端**: FastAPI + SQLAlchemy
- **数据库**: MySQL 8.0+
- **部署**: 本地开发服务器

## 快速开始

### 1. 环境准备

#### 安装Python依赖
```bash
cd security-chat-backend
pip install -r requirements.txt
```

#### 配置MySQL数据库
参考 `DATABASE_SETUP.md` 文件进行数据库配置。

### 2. 启动服务器

#### 方法一：使用启动脚本（推荐）
```bash
python start_project_server.py
```

#### 方法二：手动启动
```bash
# 初始化数据库
python init_data.py

# 启动服务器
uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### 3. 测试API
```bash
python test_project_api.py
```

## API接口详情

### 基础信息

- **基础URL**: `http://localhost:8001`
- **API前缀**: `/api/projects`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 接口列表

#### 1. 获取项目列表

**接口地址**: `GET /api/projects/list`

**请求参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| page | int | 否 | 1 | 页码 |
| page_size | int | 否 | 10 | 每页数量 |
| keyword | string | 否 | - | 搜索关键词 |
| status | string | 否 | - | 项目状态筛选 |

**响应示例**:
```json
{
  "projects": [
    {
      "id": 1,
      "name": "安全测评项目A",
      "status": "evaluating",
      "statusText": "测评中",
      "startTime": "2024-01-15",
      "expectedEndTime": "2024-02-15",
      "actualEndTime": null,
      "progress": 15.0,
      "stepProgress": 15.0,
      "totalTasks": 20,
      "completedTasks": 3,
      "updateTime": "2024-01-20 10:30",
      "currentStepIndex": 0,
      "clientName": "某科技有限公司",
      "projectManager": "张经理",
      "description": "某大型企业网络安全等级保护测评项目"
    }
  ],
  "total": 6,
  "page": 1,
  "pageSize": 10
}
```

#### 2. 获取项目详情

**接口地址**: `GET /api/projects/{project_id}`

**路径参数**:
| 参数名 | 类型 | 必填 | 说明 |
|--------|------|------|------|
| project_id | int | 是 | 项目ID |

**响应示例**:
```json
{
  "id": 1,
  "name": "安全测评项目A",
  "status": "evaluating",
  "statusText": "测评中",
  "startTime": "2024-01-15",
  "expectedEndTime": "2024-02-15",
  "progress": 15.0,
  "statusHistory": [
    {
      "id": 1,
      "status": "evaluating",
      "statusText": "测评中",
      "changedAt": "2024-01-15 09:00:00",
      "changedBy": "张经理",
      "remarks": "项目启动，状态设置为evaluating"
    }
  ]
}
```

#### 3. 获取项目统计

**接口地址**: `GET /api/projects/stats/overview`

**响应示例**:
```json
{
  "totalProjects": 6,
  "statusStats": {
    "evaluating": 2,
    "reportDrafting": 1,
    "reportReviewing": 1,
    "delivering": 1,
    "completed": 1
  },
  "avgProgress": 45.5,
  "overdueCount": 0
}
```

#### 4. 获取最近更新

**接口地址**: `GET /api/projects/recent/updates`

**请求参数**:
| 参数名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| limit | int | 否 | 5 | 返回数量限制 |

**响应示例**:
```json
{
  "recentProjects": [
    {
      "id": 1,
      "name": "安全测评项目A",
      "status": "evaluating",
      "updateTime": "2024-01-20 10:30"
    }
  ]
}
```

## 项目状态说明

| 状态值 | 中文名称 | 步骤索引 | 进度计算 |
|--------|----------|----------|----------|
| evaluating | 测评中 | 0 | 0-25% |
| report_drafting | 报告编制中 | 1 | 25-50% |
| report_reviewing | 报告审核中 | 2 | 50-75% |
| delivering | 交付中 | 3 | 75-100% |
| completed | 已完成 | 4 | 100% |

## 数据库表结构

### projects 表
```sql
CREATE TABLE projects (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL COMMENT '项目名称',
    status VARCHAR(50) NOT NULL COMMENT '项目状态',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    expected_end_time DATETIME NOT NULL COMMENT '预计完成时间',
    actual_end_time DATETIME NULL COMMENT '实际完成时间',
    progress FLOAT DEFAULT 0.0 COMMENT '项目进度百分比',
    step_progress FLOAT DEFAULT 0.0 COMMENT '当前步骤进度',
    total_tasks INT DEFAULT 0 COMMENT '总任务数',
    completed_tasks INT DEFAULT 0 COMMENT '已完成任务数',
    description TEXT NULL COMMENT '项目描述',
    client_name VARCHAR(255) NULL COMMENT '客户名称',
    project_manager VARCHAR(100) NULL COMMENT '项目经理',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间'
);
```

### project_status_history 表
```sql
CREATE TABLE project_status_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    project_id INT NOT NULL COMMENT '项目ID',
    status VARCHAR(50) NOT NULL COMMENT '状态',
    changed_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '状态变更时间',
    changed_by VARCHAR(100) NULL COMMENT '变更人',
    remarks TEXT NULL COMMENT '备注'
);
```

## 小程序集成

### 1. 配置API地址

在 `app.js` 中配置API基础URL:
```javascript
globalData: {
  // 开发环境
  apiBaseUrl: 'http://localhost:8001',
  
  // 真机调试（替换为你的本机IP）
  // apiBaseUrl: 'http://192.168.x.x:8001',
}
```

### 2. 调用API示例

```javascript
// 获取项目列表
const app = getApp()
const response = await new Promise((resolve, reject) => {
  wx.request({
    url: `${app.globalData.apiBaseUrl}/api/projects/list`,
    method: 'GET',
    success: resolve,
    fail: reject
  })
})

if (response.statusCode === 200) {
  const { projects } = response.data
  // 处理项目数据
}
```

## 错误处理

### HTTP状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 请求成功 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 错误响应格式
```json
{
  "detail": "错误描述信息"
}
```

## 性能优化

### 1. 数据库优化
- 为常用查询字段添加索引
- 使用连接池管理数据库连接
- 定期清理历史数据

### 2. API优化
- 实现分页查询减少数据传输
- 使用缓存提高响应速度
- 压缩响应数据

### 3. 小程序优化
- 实现数据缓存机制
- 使用下拉刷新更新数据
- 添加加载状态提示

## 部署说明

### 开发环境
1. 本地MySQL数据库
2. FastAPI开发服务器
3. 微信开发者工具

### 生产环境
1. 云服务器部署
2. 使用Nginx反向代理
3. 配置HTTPS证书
4. 数据库备份策略

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MySQL服务状态
   - 验证连接字符串
   - 确认用户权限

2. **API请求失败**
   - 检查服务器是否启动
   - 验证端口是否开放
   - 查看服务器日志

3. **小程序无法访问**
   - 检查网络连接
   - 验证API地址配置
   - 确认CORS设置

### 日志查看

```bash
# 查看服务器日志
tail -f uvicorn.log

# 查看数据库日志
tail -f /var/log/mysql/error.log
```

## 扩展功能

### 计划中的功能
1. 用户认证和权限管理
2. 项目文件上传和下载
3. 实时通知推送
4. 数据导出功能
5. 项目模板管理

### 自定义开发
1. 添加新的API端点
2. 扩展数据库表结构
3. 集成第三方服务
4. 自定义业务逻辑

## 联系支持

如有问题或建议，请通过以下方式联系：
- 查看项目文档
- 提交Issue
- 参考故障排除指南