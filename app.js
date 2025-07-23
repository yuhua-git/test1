// app.js
App({
  onLaunch() {
    // 初始化云开发环境
    if (!wx.cloud) {
      console.error('请使用 2.2.3 或以上的基础库以使用云能力')
    } else {
      wx.cloud.init({
        env: 'your-env-id', // 替换为你的云开发环境ID
        traceUser: true
      })
    }

    // 展示本地存储能力
    const logs = wx.getStorageSync('logs') || []
    logs.unshift(Date.now())
    wx.setStorageSync('logs', logs)

    // 登录
    wx.login({
      success: res => {
        // 发送 res.code 到后台换取 openId, sessionKey, unionId
      }
    })
  },
  globalData: {
    userInfo: null,
    // API基础URL配置
    // 注意：微信小程序调用本地服务需要特别配置
    // 1. 开发工具中调试：使用localhost
    apiBaseUrl: 'http://localhost:8001', // 开发环境使用本地服务器
    
    // 2. 真机调试：使用本机的局域网IP地址
    // 运行后端的start_server脚本可以查看本机IP
    // 取消下面的注释并替换为你的本机IP地址
    // apiBaseUrl: 'http://192.168.x.x:8001', // 替换为你的本机IP地址
    
    // 3. 生产环境：使用实际的服务器地址
    // apiBaseUrl: 'https://your-production-server.com',
    
    apiTimeout: 240000 // API请求超时时间（毫秒），增加到240秒以处理超长文本响应
  }
})
