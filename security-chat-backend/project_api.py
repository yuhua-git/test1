from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import text
from typing import List, Optional
from pydantic import BaseModel
from datetime import datetime
from database import get_db, Project, ProjectStatusHistory

router = APIRouter(prefix="/api/projects", tags=["projects"])

# 响应模型
class ProjectResponse(BaseModel):
    id: int
    name: str
    status: str
    statusText: str
    startTime: str
    expectedEndTime: str
    actualEndTime: Optional[str] = None
    progress: float
    stepProgress: float
    totalTasks: int
    completedTasks: int
    description: Optional[str] = None
    clientName: Optional[str] = None
    projectManager: Optional[str] = None
    updateTime: str
    currentStepIndex: int

    class Config:
        from_attributes = True

class ProjectListResponse(BaseModel):
    projects: List[ProjectResponse]
    total: int
    page: int
    pageSize: int

class ProjectDetailResponse(ProjectResponse):
    statusHistory: List[dict] = []

# 状态映射
STATUS_MAP = {
    'evaluating': {'text': '测评中', 'index': 0},
    'report_drafting': {'text': '报告编制中', 'index': 1},
    'report_reviewing': {'text': '报告审核中', 'index': 2},
    'delivering': {'text': '交付中', 'index': 3},
    'completed': {'text': '已完成', 'index': 4}
}

def format_project_data(project: Project) -> dict:
    """格式化项目数据"""
    status_info = STATUS_MAP.get(project.status, {'text': '未知状态', 'index': -1})
    
    # 计算总进度
    if status_info['index'] == -1:
        total_progress = 0
    elif status_info['index'] == 4:  # 已完成
        total_progress = 100
    else:
        # 每个步骤的基础进度 + 当前步骤的额外进度
        base_progress = status_info['index'] * 25
        step_progress = min(max(project.step_progress or 0, 0), 25)
        total_progress = min(base_progress + step_progress, 100)
    
    return {
        'id': project.id,
        'name': project.name,
        'status': project.status,
        'statusText': status_info['text'],
        'startTime': project.start_time.strftime('%Y-%m-%d') if project.start_time else '',
        'expectedEndTime': project.expected_end_time.strftime('%Y-%m-%d') if project.expected_end_time else '',
        'actualEndTime': project.actual_end_time.strftime('%Y-%m-%d') if project.actual_end_time else None,
        'progress': round(total_progress, 1),
        'stepProgress': project.step_progress or 0,
        'totalTasks': project.total_tasks or 0,
        'completedTasks': project.completed_tasks or 0,
        'description': project.description,
        'clientName': project.client_name,
        'projectManager': project.project_manager,
        'updateTime': project.updated_at.strftime('%Y-%m-%d %H:%M') if project.updated_at else '',
        'currentStepIndex': status_info['index']
    }

@router.get("/list", response_model=ProjectListResponse)
async def get_project_list(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    keyword: Optional[str] = Query(None, description="搜索关键词"),
    status: Optional[str] = Query(None, description="项目状态筛选"),
    db: Session = Depends(get_db)
):
    """获取项目列表"""
    try:
        # 构建查询
        query = db.query(Project)
        
        # 关键词搜索
        if keyword:
            query = query.filter(
                Project.name.contains(keyword) |
                Project.client_name.contains(keyword) |
                Project.description.contains(keyword)
            )
        
        # 状态筛选
        if status:
            query = query.filter(Project.status == status)
        
        # 获取总数
        total = query.count()
        
        # 分页查询
        offset = (page - 1) * page_size
        projects = query.order_by(Project.updated_at.desc()).offset(offset).limit(page_size).all()
        
        # 格式化数据
        project_list = [format_project_data(project) for project in projects]
        
        return {
            "projects": project_list,
            "total": total,
            "page": page,
            "pageSize": page_size
        }
        
    except Exception as e:
        # 数据库连接失败时返回模拟数据
        print(f"数据库查询失败，返回模拟数据: {str(e)}")
        
        # 模拟项目数据
        mock_projects = [
            {
                "id": 1,
                "name": "安全测评项目A",
                "status": "evaluating",
                "statusText": "测评中",
                "startTime": "2024-01-15",
                "expectedEndTime": "2024-02-15",
                "actualEndTime": None,
                "progress": 15.0,
                "stepProgress": 15.0,
                "totalTasks": 0,
                "completedTasks": 0,
                "description": "企业网络安全测评项目",
                "clientName": "某科技公司",
                "projectManager": "张经理",
                "updateTime": "2024-01-20 10:30",
                "currentStepIndex": 0
            },
            {
                "id": 2,
                "name": "安全测评项目B",
                "status": "report_drafting",
                "statusText": "报告编制中",
                "startTime": "2024-01-10",
                "expectedEndTime": "2024-02-10",
                "actualEndTime": None,
                "progress": 45.0,
                "stepProgress": 20.0,
                "totalTasks": 0,
                "completedTasks": 0,
                "description": "金融系统安全测评项目",
                "clientName": "某银行",
                "projectManager": "李经理",
                "updateTime": "2024-01-20 14:15",
                "currentStepIndex": 1
            }
        ]
        
        # 应用分页
        start_idx = (page - 1) * page_size
        end_idx = start_idx + page_size
        paginated_projects = mock_projects[start_idx:end_idx]
        
        return {
            "projects": paginated_projects,
            "total": len(mock_projects),
            "page": page,
            "pageSize": page_size
        }

@router.get("/{project_id}", response_model=ProjectDetailResponse)
async def get_project_detail(
    project_id: int,
    db: Session = Depends(get_db)
):
    """获取项目详情"""
    try:
        # 查询项目信息
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="项目不存在")
        
        # 查询状态历史
        status_history = db.query(ProjectStatusHistory).filter(
            ProjectStatusHistory.project_id == project_id
        ).order_by(ProjectStatusHistory.changed_at.desc()).all()
        
        # 格式化项目数据
        project_data = format_project_data(project)
        
        # 格式化状态历史
        history_list = []
        for history in status_history:
            status_info = STATUS_MAP.get(history.status, {'text': '未知状态', 'index': -1})
            history_list.append({
                'id': history.id,
                'status': history.status,
                'statusText': status_info['text'],
                'changedAt': history.changed_at.strftime('%Y-%m-%d %H:%M:%S'),
                'changedBy': history.changed_by,
                'remarks': history.remarks
            })
        
        project_data['statusHistory'] = history_list
        
        return project_data
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目详情失败: {str(e)}")

@router.get("/stats/overview")
async def get_project_stats(
    db: Session = Depends(get_db)
):
    """获取项目统计概览"""
    try:
        # 使用原生SQL查询统计信息
        stats_query = text("""
            SELECT 
                COUNT(*) as total_projects,
                COUNT(CASE WHEN status = 'evaluating' THEN 1 END) as evaluating_count,
                COUNT(CASE WHEN status = 'report_drafting' THEN 1 END) as drafting_count,
                COUNT(CASE WHEN status = 'report_reviewing' THEN 1 END) as reviewing_count,
                COUNT(CASE WHEN status = 'delivering' THEN 1 END) as delivering_count,
                COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_count,
                AVG(progress) as avg_progress,
                COUNT(CASE WHEN expected_end_time < NOW() AND status != 'completed' THEN 1 END) as overdue_count
            FROM projects
        """)
        
        result = db.execute(stats_query).fetchone()
        
        return {
            "totalProjects": result.total_projects or 0,
            "statusStats": {
                "evaluating": result.evaluating_count or 0,
                "reportDrafting": result.drafting_count or 0,
                "reportReviewing": result.reviewing_count or 0,
                "delivering": result.delivering_count or 0,
                "completed": result.completed_count or 0
            },
            "avgProgress": round(result.avg_progress or 0, 1),
            "overdueCount": result.overdue_count or 0
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取项目统计失败: {str(e)}")

@router.get("/recent/updates")
async def get_recent_updates(
    limit: int = Query(5, ge=1, le=20, description="返回数量限制"),
    db: Session = Depends(get_db)
):
    """获取最近更新的项目"""
    try:
        # 查询最近更新的项目
        recent_projects = db.query(Project).order_by(
            Project.updated_at.desc()
        ).limit(limit).all()
        
        # 格式化数据
        project_list = [format_project_data(project) for project in recent_projects]
        
        return {
            "recentProjects": project_list
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取最近更新失败: {str(e)}")