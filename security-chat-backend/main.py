from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import requests
import json

app = FastAPI(title="Security Chat API", description="安全智能问答系统API", version="1.0.0")

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 允许所有来源，生产环境中应该限制为特定域名
    allow_credentials=True,
    allow_methods=["*"],  # 允许所有方法
    allow_headers=["*"],  # 允许所有头部
)

# LLM 配置
LLM_URL = "http://192.168.30.99:9997/v1"
LLM_NAME = "qwen3"
LLM_API_KEY = "notused"

class ChatRequest(BaseModel):
    message: str
    session_id: str = None  # 可选的会话ID，用于未来扩展

class ChatResponse(BaseModel):
    response: str

@app.post("/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        # 准备请求 payload，兼容 OpenAI Chat API 格式
        payload = {
            "model": LLM_NAME,
            "messages": [
                {"role": "system", "content": "你是一个安全领域的专业助手，能够提供网络安全、数据安全和企业安全相关的专业建议。"},
                {"role": "user", "content": request.message}
            ],
            "temperature": 0.7,
            "max_tokens": 800
        }
        
        headers = {
            "Authorization": f"Bearer {LLM_API_KEY}",
            "Content-Type": "application/json"
        }
        
        # 调用 LLM 端点
        response = requests.post(f"{LLM_URL}/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        
        # 解析响应（假设返回格式兼容 OpenAI）
        result = response.json()
        ai_response = result['choices'][0]['message']['content']
        
        return {"response": ai_response}
    except requests.RequestException as e:
        raise HTTPException(status_code=500, detail=f"LLM调用失败: {str(e)}")
    except KeyError:
        raise HTTPException(status_code=500, detail="LLM响应格式无效")



@app.on_event("startup")
async def startup_event():
    """应用启动时的初始化操作"""
    print("正在启动安全智能问答系统API...")

@app.get("/")
def root():
    return {
        "message": "Security Chat API is running",
        "version": "1.0.0",
        "endpoints": {
            "chat": "/chat"
        }
    }

@app.get("/health")
def health_check():
    """健康检查接口"""
    return {
        "status": "healthy",
        "service": "chat",
        "timestamp": requests.get("http://worldtimeapi.org/api/timezone/Asia/Shanghai").json().get("datetime", "unknown")
    }