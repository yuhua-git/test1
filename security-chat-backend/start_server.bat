@echo off
echo 正在启动AI智能问答后端服务...
echo.

REM 检查Python是否安装
python --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 未检测到Python，请安装Python 3.7+
    pause
    exit /b 1
)

REM 检查并安装所有依赖
echo 检查并安装依赖...

REM 检查requirements.txt文件是否存在
if not exist requirements.txt (
    echo 错误: 未找到requirements.txt文件
    pause
    exit /b 1
)

REM 安装所有依赖
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo 错误: 依赖安装失败
    pause
    exit /b 1
)

echo 所有依赖已安装
echo.

REM 启动服务器
echo 启动服务器...
echo 服务将在 http://localhost:8001 上运行
echo 本地IP地址: 
for /f "tokens=4" %%a in ('route print ^| find " 0.0.0.0"') do (
    if not "%%a"=="0.0.0.0" echo http://%%a:8001 （用于真机调试）
)
echo.
echo 按Ctrl+C可停止服务器
echo.
uvicorn main:app --reload --host 0.0.0.0 --port 8001

pause