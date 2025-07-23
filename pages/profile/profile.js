Page({
  data: {
    userInfo: null,
    isLogin: false,
    menuList: [
      {
        icon: 'notification',
        text: '消息通知',
        url: '/pages/notifications/notifications'
      },
      {
        icon: 'setting',
        text: '系统设置',
        url: '/pages/settings/settings'
      },
      {
        icon: 'service',
        text: '联系客服',
        type: 'contact'
      },
      {
        icon: 'info',
        text: '关于我们',
        url: '/pages/about/about'
      }
    ]
  },

  onShow() {
    this.checkLoginStatus()
  },

  async checkLoginStatus() {
    try {
      const userInfo = await wx.getStorageSync('userInfo')
      this.setData({
        userInfo,
        isLogin: !!userInfo
      })
    } catch (error) {
      console.error('检查登录状态失败', error)
    }
  },

  async handleLogin() {
    try {
      // 调用微信接口获取用户信息
      const { userInfo } = await wx.getUserProfile({
        desc: '用于完善会员资料' // 向用户说明获取用户信息的用途
      })
      
      // 保存用户信息到本地存储
      const userData = {
        ...userInfo,
        loginTime: new Date().getTime()
      }
      
      wx.setStorageSync('userInfo', userData)
      this.setData({
        userInfo: userData,
        isLogin: true
      })

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('登录失败', error)
      // 用户拒绝授权时不显示错误提示
      if (error.errMsg !== 'getUserProfile:fail auth deny') {
        wx.showToast({
          title: '登录失败，请稍后重试',
          icon: 'none'
        })
      }
    }
  },

  handleLogout() {
    wx.showModal({
      title: '提示',
      content: '确定要退出登录吗？',
      success: (res) => {
        if (res.confirm) {
          wx.removeStorageSync('userInfo')
          this.setData({
            userInfo: null,
            isLogin: false
          })
        }
      }
    })
  },

  handleMenuClick(e) {
    const { url, type } = e.currentTarget.dataset
    if (type === 'contact') return
    
    if (url) {
      wx.navigateTo({ url })
    }
  }
})