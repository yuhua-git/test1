// debug.js - 用于调试API请求的辅助函数

/**
 * 检查API基础URL配置
 * 在控制台输出当前的API基础URL配置
 */
function checkApiBaseUrl() {
  const app = getApp()
  console.log('=== API配置检查 ===')
  console.log('当前API基础URL:', app.globalData.apiBaseUrl)
  console.log('预期的API基础URL应为: http://localhost:8001')
  
  if (app.globalData.apiBaseUrl.includes('8000')) {
    console.error('警告: API基础URL仍然使用旧端口(8000)，请更新app.js中的配置')
  } else if (app.globalData.apiBaseUrl.includes('8001')) {
    console.log('✓ API基础URL配置正确')
  }
}

/**
 * 发送测试请求到API
 * 检查请求是否成功发送到正确的端口
 */
function testApiRequest() {
  const app = getApp()
  console.log('=== 发送测试请求 ===')
  console.log('发送请求到:', app.globalData.apiBaseUrl + '/chat')
  
  wx.request({
    url: app.globalData.apiBaseUrl + '/chat',
    method: 'POST',
    data: {
      message: '测试消息 - ' + new Date().toLocaleTimeString(),
      session_id: 'debug-session'
    },
    success: function(res) {
      console.log('✓ 请求成功:', res)
    },
    fail: function(err) {
      console.error('✗ 请求失败:', err)
      
      // 尝试请求旧端口，检查是否存在缓存问题
      const oldUrl = app.globalData.apiBaseUrl.replace('8001', '8000')
      console.log('尝试请求旧端口:', oldUrl + '/chat')
      
      wx.request({
        url: oldUrl + '/chat',
        method: 'POST',
        data: {
          message: '测试旧端口 - ' + new Date().toLocaleTimeString(),
          session_id: 'debug-session'
        },
        success: function(res) {
          console.log('警告: 旧端口请求成功，这表明可能存在多个服务:', res)
        },
        fail: function(err) {
          console.log('✓ 旧端口请求失败，这是预期的结果:', err)
        },
        complete: function() {}
      })
    },
    complete: function() {}
  })
}

/**
 * 运行所有调试检查
 */
function runDebugChecks() {
  console.log('======== 开始API调试 ========')
  checkApiBaseUrl()
  testApiRequest()
  console.log('请查看控制台输出的调试信息')
}

module.exports = {
  checkApiBaseUrl,
  testApiRequest,
  runDebugChecks
}