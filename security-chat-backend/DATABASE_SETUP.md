# 数据库配置说明

## MySQL数据库设置

### 1. 安装MySQL

#### macOS (使用Homebrew)
```bash
brew install mysql
brew services start mysql
```

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

#### Windows
下载并安装MySQL Community Server: https://dev.mysql.com/downloads/mysql/

### 2. 创建数据库和用户

登录MySQL:
```bash
mysql -u root -p
```

执行以下SQL命令:
```sql
-- 创建数据库
CREATE DATABASE security_project_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 创建用户（可选，也可以使用root用户）
CREATE USER 'security_user'@'localhost' IDENTIFIED BY 'your_password';

-- 授权
GRANT ALL PRIVILEGES ON security_project_db.* TO 'security_user'@'localhost';
FLUSH PRIVILEGES;

-- 退出
EXIT;
```

### 3. 配置数据库连接

在 `security-chat-backend` 目录下创建 `.env` 文件:
```bash
# 数据库配置
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/security_project_db

# 或者使用创建的专用用户
# DATABASE_URL=mysql+pymysql://security_user:your_password@localhost:3306/security_project_db
```

### 4. 数据库表结构

系统会自动创建以下表:

#### projects 表 (项目表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| name | VARCHAR(255) | 项目名称 |
| status | VARCHAR(50) | 项目状态 |
| start_time | DATETIME | 开始时间 |
| expected_end_time | DATETIME | 预计完成时间 |
| actual_end_time | DATETIME | 实际完成时间 |
| progress | FLOAT | 项目进度百分比 |
| step_progress | FLOAT | 当前步骤进度 |
| total_tasks | INT | 总任务数 |
| completed_tasks | INT | 已完成任务数 |
| description | TEXT | 项目描述 |
| client_name | VARCHAR(255) | 客户名称 |
| project_manager | VARCHAR(100) | 项目经理 |
| created_at | DATETIME | 创建时间 |
| updated_at | DATETIME | 更新时间 |

#### project_status_history 表 (项目状态历史表)
| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INT | 主键，自增 |
| project_id | INT | 项目ID |
| status | VARCHAR(50) | 状态 |
| changed_at | DATETIME | 状态变更时间 |
| changed_by | VARCHAR(100) | 变更人 |
| remarks | TEXT | 备注 |

### 5. 项目状态说明

| 状态值 | 中文名称 | 步骤索引 | 说明 |
|--------|----------|----------|------|
| evaluating | 测评中 | 0 | 正在进行安全测评 |
| report_drafting | 报告编制中 | 1 | 正在编制测评报告 |
| report_reviewing | 报告审核中 | 2 | 报告正在审核 |
| delivering | 交付中 | 3 | 正在交付给客户 |
| completed | 已完成 | 4 | 项目已完成 |

### 6. 初始化示例数据

运行初始化脚本创建示例数据:
```bash
cd security-chat-backend
python init_data.py
```

### 7. 常见问题

#### 连接被拒绝
- 检查MySQL服务是否启动
- 检查端口3306是否开放
- 检查用户名密码是否正确

#### 字符编码问题
- 确保数据库使用utf8mb4字符集
- 检查连接字符串中的编码设置

#### 权限问题
- 确保用户有足够的权限访问数据库
- 检查防火墙设置

### 8. 生产环境建议

1. **安全性**:
   - 使用强密码
   - 限制数据库用户权限
   - 启用SSL连接

2. **性能优化**:
   - 配置适当的连接池大小
   - 添加必要的索引
   - 定期备份数据

3. **监控**:
   - 监控数据库连接数
   - 监控查询性能
   - 设置日志记录