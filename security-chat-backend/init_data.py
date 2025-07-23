#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
数据库初始化脚本
用于创建示例项目数据
"""

from sqlalchemy.orm import Session
from database import SessionLocal, Project, ProjectStatusHistory, create_tables
from datetime import datetime, timedelta
import random

def create_sample_data():
    """创建示例数据"""
    db = SessionLocal()
    
    try:
        # 检查是否已有数据
        existing_count = db.query(Project).count()
        if existing_count > 0:
            print(f"数据库中已存在 {existing_count} 个项目，跳过初始化")
            return
        
        print("开始创建示例项目数据...")
        
        # 示例项目数据
        sample_projects = [
            {
                'name': '安全测评项目A',
                'status': 'evaluating',
                'start_time': datetime(2024, 1, 15),
                'expected_end_time': datetime(2024, 2, 15),
                'step_progress': 15.0,
                'total_tasks': 20,
                'completed_tasks': 3,
                'description': '某大型企业网络安全等级保护测评项目',
                'client_name': '某科技有限公司',
                'project_manager': '张经理'
            },
            {
                'name': '安全测评项目B',
                'status': 'report_drafting',
                'start_time': datetime(2024, 1, 10),
                'expected_end_time': datetime(2024, 2, 10),
                'step_progress': 20.0,
                'total_tasks': 25,
                'completed_tasks': 18,
                'description': '金融行业信息系统安全评估项目',
                'client_name': '某银行股份有限公司',
                'project_manager': '李经理'
            },
            {
                'name': '安全测评项目C',
                'status': 'report_reviewing',
                'start_time': datetime(2024, 1, 5),
                'expected_end_time': datetime(2024, 2, 5),
                'step_progress': 10.0,
                'total_tasks': 15,
                'completed_tasks': 12,
                'description': '政府部门网络安全检查项目',
                'client_name': '某政府部门',
                'project_manager': '王经理'
            },
            {
                'name': '安全测评项目D',
                'status': 'delivering',
                'start_time': datetime(2024, 1, 1),
                'expected_end_time': datetime(2024, 2, 1),
                'step_progress': 5.0,
                'total_tasks': 30,
                'completed_tasks': 28,
                'description': '制造业工控系统安全评估项目',
                'client_name': '某制造集团',
                'project_manager': '赵经理'
            },
            {
                'name': '安全测评项目E',
                'status': 'completed',
                'start_time': datetime(2023, 12, 1),
                'expected_end_time': datetime(2024, 1, 1),
                'actual_end_time': datetime(2023, 12, 28),
                'step_progress': 25.0,
                'total_tasks': 22,
                'completed_tasks': 22,
                'description': '教育行业数据安全合规检查项目',
                'client_name': '某大学',
                'project_manager': '陈经理'
            },
            {
                'name': '安全测评项目F',
                'status': 'evaluating',
                'start_time': datetime(2024, 1, 20),
                'expected_end_time': datetime(2024, 3, 20),
                'step_progress': 8.0,
                'total_tasks': 35,
                'completed_tasks': 5,
                'description': '医疗行业信息安全风险评估项目',
                'client_name': '某医院集团',
                'project_manager': '刘经理'
            }
        ]
        
        # 创建项目记录
        created_projects = []
        for project_data in sample_projects:
            project = Project(**project_data)
            db.add(project)
            db.flush()  # 获取项目ID
            created_projects.append(project)
            
            # 为每个项目创建状态历史记录
            status_history = ProjectStatusHistory(
                project_id=project.id,
                status=project.status,
                changed_at=project.start_time,
                changed_by=project.project_manager,
                remarks=f"项目启动，状态设置为{project.status}"
            )
            db.add(status_history)
            
            # 如果项目已完成，添加更多状态历史
            if project.status == 'completed':
                statuses = ['evaluating', 'report_drafting', 'report_reviewing', 'delivering', 'completed']
                for i, status in enumerate(statuses[1:], 1):
                    history_date = project.start_time + timedelta(days=i*5)
                    history = ProjectStatusHistory(
                        project_id=project.id,
                        status=status,
                        changed_at=history_date,
                        changed_by=project.project_manager,
                        remarks=f"项目进入{status}阶段"
                    )
                    db.add(history)
        
        # 提交所有更改
        db.commit()
        print(f"✅ 成功创建 {len(created_projects)} 个示例项目")
        
        # 显示创建的项目信息
        for project in created_projects:
            print(f"  - {project.name} (状态: {project.status})")
            
    except Exception as e:
        db.rollback()
        print(f"❌ 创建示例数据失败: {e}")
        raise
    finally:
        db.close()

def main():
    """主函数"""
    print("=== 数据库初始化脚本 ===")
    
    # 创建数据库表
    print("创建数据库表...")
    create_tables()
    print("✅ 数据库表创建完成")
    
    # 创建示例数据
    create_sample_data()
    
    print("=== 初始化完成 ===")

if __name__ == "__main__":
    main()