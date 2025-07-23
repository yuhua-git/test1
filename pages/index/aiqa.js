// AI智能问答模块
// 提供AI聊天相关的数据和方法

module.exports = {
  // AI相关的初始数据
  getInitialData: function() {
    return {
      // AI智能问答相关数据
      chatInput: '',
      chatHistory: [],
      suggestedQuestions: [
        '如何防范网络钓鱼攻击？',
        '什么是零信任安全架构？',
        '如何保护企业数据安全？',
        '常见的网络攻击类型有哪些？'
      ],
      lastMessageId: '',
      isLoading: false, // 加载状态标志
      sessionId: '', // 会话ID
      focusInput: false // 控制输入框聚焦
    }
  },

  // AI相关的方法
  getMethods: function() {
    return {
      // AI智能问答相关方法
      onChatInput: function(e) {
        this.setData({
          chatInput: e.detail.value
        })
      },
      
      // 处理输入框失焦
      onInputBlur: function() {
        this.setData({
          focusInput: false
        })
      },

      sendQuestion: function(replyToMessage, retryCount = 0) {
        const question = this.data.chatInput.trim()
        if (!question) return

        // 添加用户问题到聊天历史（仅在非重试时添加）
        if (retryCount === 0) {
          const userMessage = {
            type: 'user',
            content: question,
            id: Date.now().toString(),
            replyTo: replyToMessage || null
          }

          // 设置加载状态
          this.setData({
            chatHistory: [...this.data.chatHistory, userMessage],
            chatInput: '',
            isLoading: true // 显示加载状态
          })
        } else {
          console.log(`正在进行第 ${retryCount} 次重试...`);
          // 仅更新加载状态
          this.setData({
            isLoading: true
          })
        }

        // 导入工具函数
        const util = require('../../utils/util.js')
        
        // 处理长文本，增加最大长度限制
        let processedQuestion = '/no_think' + question
        const maxLength = 5000 // 增加到5000字符，适应更长的输入
        
        if (question.length > maxLength) {
          // 分段处理长文本
          processedQuestion = '/no_think' + question.substring(0, maxLength) + '...'
          console.log('文本过长，已截断处理，原长度:', question.length, '截断后长度:', maxLength)
          
          // 显示提示信息
          wx.showToast({
            title: '文本过长已截断',
            icon: 'none',
            duration: 2000
          })
        }
        
        // 记录发送时间
        const sendTime = new Date().toLocaleTimeString();
        console.log('发送问题时间:', sendTime, '问题长度:', processedQuestion.length);
        
        // 调用工具函数发送聊天消息
        util.sendChatMessage({
          message: processedQuestion,
          sessionId: this.data.sessionId || '',
          showLoading: false, // 不使用wx.showLoading，使用自定义加载指示器
          success: (response) => {
            // 处理长文本回复，将换行符转换为<br/>标签以便rich-text显示
            let formattedResponse = response
              .replace(/\n/g, '<br/>')
              .replace(/\s{2,}/g, function(match) {
                return '&nbsp;'.repeat(match.length);
              })
            
            const aiMessage = {
              type: 'ai',
              content: formattedResponse,
              id: Date.now().toString()
            }
            
            this.setData({
              chatHistory: [...this.data.chatHistory, aiMessage],
              lastMessageId: `msg-${this.data.chatHistory.length}`,
              isLoading: false // 隐藏加载状态
            })
          },
          fail: (err) => {
            console.error('API请求失败:', err);
            
            // 检查是否是超时错误
            const isTimeout = err.errMsg && (err.errMsg.includes('timeout') || err.errMsg.includes('超时'));
            
            // 最大重试次数
            const MAX_RETRY = 2;
            
            // 如果是超时错误且未达到最大重试次数，则自动重试
            if (isTimeout && retryCount < MAX_RETRY) {
              const nextRetryCount = retryCount + 1;
              console.log(`请求超时，将在3秒后进行第 ${nextRetryCount} 次重试...`);
              
              // 显示重试提示
              wx.showToast({
                title: `请求超时，正在重试(${nextRetryCount}/${MAX_RETRY})`,
                icon: 'none',
                duration: 2000
              });
              
              // 延迟3秒后重试
              setTimeout(() => {
                this.sendQuestion(replyToMessage, nextRetryCount);
              }, 3000);
            } else {
              // 达到最大重试次数或非超时错误，显示错误信息
              this.handleApiError(err.errMsg || '网络请求失败', retryCount);
            }
          },
          complete: () => {
            // 确保在任何情况下都关闭加载状态
            this.setData({
              isLoading: false
            })
          }
        })
      },

      handleApiError: function(errorMsg, retryCount = 0) {
        // 记录原始错误信息
        console.error('API错误:', errorMsg, '重试次数:', retryCount);
        
        // 处理超时错误，提供更友好的提示
        let friendlyMessage = errorMsg;
        let detailedMessage = '';
        
        if (errorMsg.includes('timeout') || errorMsg.includes('超时')) {
          friendlyMessage = '响应时间过长';
          
          // 如果已经重试过，显示重试信息
          if (retryCount > 0) {
            friendlyMessage += ` (已重试${retryCount}次)`;
          }
          
          detailedMessage = '可能是因为文本内容过大或服务器繁忙。请尝试以下解决方法：<br/>1. 发送更简短的问题<br/>2. 将复杂问题拆分为多个简单问题<br/>3. 稍后再试';
        } else if (errorMsg.includes('fail')) {
          friendlyMessage = '请求失败';
          detailedMessage = '无法连接到服务器，请检查网络连接或稍后再试。';
        } else {
          detailedMessage = '发生未知错误，请稍后再试。';
        }
        
        // 显示错误消息
        const aiMessage = {
          type: 'ai',
          content: `<span style="color:#ff6b6b">抱歉，遇到了问题：${friendlyMessage}。</span><br/><br/>${detailedMessage}`,
          id: Date.now().toString()
        }
        
        this.setData({
          chatHistory: [...this.data.chatHistory, aiMessage],
          lastMessageId: `msg-${this.data.chatHistory.length}`,
          isLoading: false // 确保关闭加载状态
        })
        
        // 显示简短的错误提示
        const toastMessage = friendlyMessage.length > 20 ? friendlyMessage.substring(0, 20) + '...' : friendlyMessage;
        wx.showToast({
          title: toastMessage,
          icon: 'none',
          duration: 3000
        })
      },

      selectQuestion: function(e) {
        const question = e.currentTarget.dataset.question
        this.setData({
          chatInput: question
        }, () => {
          this.sendQuestion()
        })
      },
      
      // 复制消息内容
      copyMessage: function(e) {
        const content = e.currentTarget.dataset.content
        const index = e.currentTarget.dataset.index
        const messageType = this.data.chatHistory[index].type
        
        // 如果内容包含HTML标签，需要提取纯文本
        const plainText = content.replace(/<br\/?>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')
        
        // 根据消息类型设置不同的复制内容
        let copyText = plainText;
        
        // 如果是AI回答，添加引用信息
        if (messageType === 'ai') {
          copyText = `【AI回答】\n${plainText}\n\n来自安全助手的回答`;
        }
        
        wx.setClipboardData({
          data: copyText,
          success: () => {
            wx.showToast({
              title: '复制成功',
              icon: 'success',
              duration: 1500
            })
          },
          fail: () => {
            wx.showToast({
              title: '复制失败',
              icon: 'none',
              duration: 1500
            })
          }
        })
      },
      
      // 引用消息
      quoteMessage: function(e) {
        const content = e.currentTarget.dataset.content
        const messageType = e.currentTarget.dataset.type
        
        // 提取纯文本并截取前30个字符作为引用
        const plainText = content.replace(/<br\/?>/g, '\n').replace(/&nbsp;/g, ' ').replace(/<[^>]+>/g, '')
        const quote = plainText.length > 30 ? plainText.substring(0, 30) + '...' : plainText
        
        // 根据消息类型设置不同的引用前缀
        let quotePrefix = '';
        if (messageType === 'user') {
          quotePrefix = '引用我的问题: ';
        } else if (messageType === 'ai') {
          quotePrefix = '引用AI回答: ';
        }
        
        this.setData({
          chatInput: `${quotePrefix}"${quote}" \n`
        })
        
        // 聚焦输入框
        this.setData({
          focusInput: true
        })
      }
    }
  }
}