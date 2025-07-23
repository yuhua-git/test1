from sqlalchemy import create_engine, Column, Integer, String, DateTime, Float, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# 数据库配置
DATABASE_URL = os.getenv(
    "DATABASE_URL", 
    "mysql+pymysql://root:password@localhost:3306/security_project_db"
)

# 创建数据库引擎
engine = create_engine(
    DATABASE_URL,
    echo=True,  # 开发环境下显示SQL语句
    pool_pre_ping=True,  # 连接池预检查
    pool_recycle=3600,  # 连接回收时间
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

# 项目表模型
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, comment="项目名称")
    status = Column(String(50), nullable=False, comment="项目状态")
    start_time = Column(DateTime, nullable=False, comment="开始时间")
    expected_end_time = Column(DateTime, nullable=False, comment="预计完成时间")
    actual_end_time = Column(DateTime, nullable=True, comment="实际完成时间")
    progress = Column(Float, default=0.0, comment="项目进度百分比")
    step_progress = Column(Float, default=0.0, comment="当前步骤进度")
    total_tasks = Column(Integer, default=0, comment="总任务数")
    completed_tasks = Column(Integer, default=0, comment="已完成任务数")
    description = Column(Text, nullable=True, comment="项目描述")
    client_name = Column(String(255), nullable=True, comment="客户名称")
    project_manager = Column(String(100), nullable=True, comment="项目经理")
    created_at = Column(DateTime, default=datetime.utcnow, comment="创建时间")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, comment="更新时间")

# 项目状态历史表模型
class ProjectStatusHistory(Base):
    __tablename__ = "project_status_history"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, nullable=False, comment="项目ID")
    status = Column(String(50), nullable=False, comment="状态")
    changed_at = Column(DateTime, default=datetime.utcnow, comment="状态变更时间")
    changed_by = Column(String(100), nullable=True, comment="变更人")
    remarks = Column(Text, nullable=True, comment="备注")

# 获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建所有表
def create_tables():
    Base.metadata.create_all(bind=engine)

# 数据库连接测试
def test_connection():
    try:
        with engine.connect() as connection:
            result = connection.execute("SELECT 1")
            return True
    except Exception as e:
        print(f"数据库连接失败: {e}")
        return False