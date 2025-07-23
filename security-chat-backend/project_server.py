from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from project_api import router as project_router
from database import create_tables, test_connection
import requests

app = FastAPI(title="Project Management API", description="项目管理系统API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# 包含项目相关的路由
app.include_router(project_router)

@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化操作"""
    print("正在启动项目管理系统API...")
    
    # 测试数据库连接
    if test_connection():
        print("✅ 数据库连接成功")
        # 创建数据库表
        create_tables()
        print("✅ 数据库表初始化完成")
    else:
        print("❌ 数据库连接失败，请检查配置")

@app.get("/")
def root():
    return {
        "message": "Project Management API is running",
        "version": "1.0.0",
        "endpoints": {
            "projects": "/api/projects",
            "project_list": "/api/projects/list",
            "project_detail": "/api/projects/{id}",
            "project_stats": "/api/projects/stats/overview",
            "recent_updates": "/api/projects/recent/updates"
        }
    }

@app.get("/health")
def health_check():
    """健康检查接口"""
    db_status = test_connection()
    return {
        "status": "healthy" if db_status else "unhealthy",
        "database": "connected" if db_status else "disconnected",
        "timestamp": requests.get("http://worldtimeapi.org/api/timezone/Asia/Shanghai").json().get("datetime", "unknown") if db_status else "unknown"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8002)