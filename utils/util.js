const formatTime = date => {
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  const hour = date.getHours()
  const minute = date.getMinutes()
  const second = date.getSeconds()

  return `${[year, month, day].map(formatNumber).join('/')} ${[hour, minute, second].map(formatNumber).join(':')}`
}

const formatNumber = n => {
  n = n.toString()
  return n[1] ? n : `0${n}`
}

/**
 * 发送请求到后端API
 * @param {Object} options - 请求选项
 * @param {string} options.url - 请求URL路径（不包含基础URL）
 * @param {string} options.method - 请求方法 (GET, POST, PUT, DELETE)
 * @param {Object} options.data - 请求数据
 * @param {Function} options.success - 成功回调函数
 * @param {Function} options.fail - 失败回调函数
 * @param {Function} options.complete - 完成回调函数
 */
const request = (options) => {
  const app = getApp()
  const baseUrl = app.globalData.apiBaseUrl
  // 允许通过options传入自定义超时时间，否则使用全局配置或默认值
  const timeout = options.timeout || app.globalData.apiTimeout || 240000 // 默认240秒超时，适应超长文本响应
  
  // 显示加载中
  if (options.showLoading !== false) {
    wx.showLoading({
      title: options.loadingText || '加载中...',
    })
  }
  
  // 记录请求开始时间
  const startTime = new Date();
  console.log(`请求开始: ${options.url}, 超时设置: ${timeout}ms, 时间: ${startTime.toLocaleTimeString()}`);
  
  // 设置超时定时器
  const timeoutTimer = setTimeout(() => {
    const timeoutTime = new Date();
    const elapsedTime = timeoutTime - startTime;
    console.error(`请求超时: ${options.url}, 已耗时: ${elapsedTime}ms, 超时阈值: ${timeout}ms, 时间: ${timeoutTime.toLocaleTimeString()}`);
    
    wx.hideLoading()
    if (typeof options.fail === 'function') {
      options.fail({ 
        errMsg: 'request:timeout', 
        elapsedTime: elapsedTime,
        url: options.url,
        timeout: timeout
      })
    }
  }, timeout)
  
  // 发送请求
  wx.request({
    url: `${baseUrl}${options.url}`,
    method: options.method || 'GET',
    data: options.data || {},
    header: {
      'content-type': 'application/json',
      ...options.header
    },
    success: (res) => {
      clearTimeout(timeoutTimer)
      if (options.showLoading !== false) {
        wx.hideLoading()
      }
      
      // 记录请求成功详情
      const successTime = new Date();
      const elapsedTime = successTime - startTime;
      console.log(`请求成功: ${options.url}, 状态码: ${res.statusCode}, 耗时: ${elapsedTime}ms, 时间: ${successTime.toLocaleTimeString()}`);
      
      // 记录响应大小
      const responseSize = JSON.stringify(res.data).length;
      console.log(`响应大小: ${responseSize} 字符`);
      
      // 处理不同状态码
      if (res.statusCode >= 200 && res.statusCode < 300) {
        try {
          if (typeof options.success === 'function') {
            options.success(res.data)
          }
        } catch (error) {
          console.error('处理成功响应时出错:', error);
          if (typeof options.fail === 'function') {
            options.fail({ errMsg: '处理响应时出错: ' + error.message })
          }
        }
      } else if (res.statusCode >= 400 && res.statusCode < 500) {
        if (typeof options.fail === 'function') {
          options.fail({ errMsg: '请求参数错误', statusCode: res.statusCode, data: res.data })
        }
      } else if (res.statusCode >= 500) {
        if (typeof options.fail === 'function') {
          options.fail({ errMsg: '服务器内部错误', statusCode: res.statusCode, data: res.data })
        }
      } else {
        if (typeof options.fail === 'function') {
          options.fail({ errMsg: '未知错误', statusCode: res.statusCode, data: res.data })
        }
      }
    },
    fail: (err) => {
      clearTimeout(timeoutTimer)
      if (options.showLoading !== false) {
        wx.hideLoading()
      }
      
      // 记录请求失败详情
      const failTime = new Date();
      const elapsedTime = failTime - startTime;
      console.error(`请求失败: ${options.url}, 错误: ${err.errMsg}, 已耗时: ${elapsedTime}ms, 时间: ${failTime.toLocaleTimeString()}`);
      console.error('请求详情:', {
        url: `${baseUrl}${options.url}`,
        method: options.method || 'GET',
        data: JSON.stringify(options.data || {}),
        error: err
      });
      
      if (typeof options.fail === 'function') {
        // 增强错误信息
        err.elapsedTime = elapsedTime;
        err.requestUrl = options.url;
        err.requestMethod = options.method || 'GET';
        options.fail(err)
      }
    },
    complete: () => {
      if (typeof options.complete === 'function') {
        options.complete()
      }
    }
  })
}

/**
 * 发送聊天消息到AI接口
 * @param {Object} options - 请求选项
 * @param {string} options.message - 用户消息
 * @param {string} options.sessionId - 会话ID（可选）
 * @param {Function} options.success - 成功回调函数
 * @param {Function} options.fail - 失败回调函数
 */
const sendChatMessage = (options) => {
  // 设置更长的超时时间，专门用于聊天请求
  const chatTimeout = 300000; // 5分钟超时，适应超长文本响应
  console.log('发送聊天消息，设置超时时间为:', chatTimeout, 'ms')
  
  request({
    url: '/chat',
    method: 'POST',
    data: {
      message: options.message,
      session_id: options.sessionId || ''
    },
    loadingText: '正在思考中...',
    showLoading: options.showLoading, // 传递showLoading参数
    timeout: chatTimeout, // 为聊天请求单独设置更长的超时时间
    success: (data) => {
      if (data && data.response) {
        // 处理可能的长文本响应
        try {
          // 检查响应大小，如果过大则进行分段处理
          const responseLength = data.response.length;
          console.log('收到响应，长度:', responseLength, '字符');
          
          // 记录响应时间
          const responseTime = new Date().toLocaleTimeString();
          console.log('响应接收时间:', responseTime);
          
          if (typeof options.success === 'function') {
            options.success(data.response)
          }
        } catch (error) {
          console.error('处理响应时出错:', error)
          console.error('错误详情:', error.stack || '无堆栈信息')
          if (typeof options.fail === 'function') {
            options.fail({ errMsg: '处理响应时出错: ' + error.message })
          }
        }
      } else {
        console.error('API返回数据格式错误:', data)
        if (typeof options.fail === 'function') {
          options.fail({ errMsg: '返回数据格式错误' })
        }
      }
    },
    fail: (err) => {
      // 增强错误信息
      console.error('聊天请求失败:', err);
      
      // 记录请求详情
      console.error('请求详情:', {
        url: '/chat',
        message: options.message.substring(0, 100) + (options.message.length > 100 ? '...' : ''),
        messageLength: options.message.length,
        sessionId: options.sessionId || '',
        timeout: chatTimeout
      });
      
      if (typeof options.fail === 'function') {
        options.fail(err);
      }
    },
    complete: () => {
      console.log('聊天请求完成');
      if (typeof options.complete === 'function') {
        options.complete();
      }
    } // 传递complete回调
  })
}

module.exports = {
  formatTime,
  request,
  sendChatMessage
}
