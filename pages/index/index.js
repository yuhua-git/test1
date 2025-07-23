// 引入AI智能问答模块
const aiqa = require('./aiqa.js')

Page({
  data: {
    bannerList: [
      '#4a90e2', // 蓝色背景
      '#50c878', // 绿色背景
      '#ff6b6b'  // 红色背景
    ],
    securityScore: 85,
    warningCount: 3,
    safeCount: 12,
    newsList: [
      {
        id: 1,
        title: '关于近期高发的钓鱼攻击预警',
        bgColor: '#4a90e2', // 蓝色背景替代图片
        time: '2023-05-20'
      },
      {
        id: 2,
        title: '企业安全建设最佳实践分享',
        bgColor: '#50c878', // 绿色背景替代图片
        time: '2023-05-18'
      },
      {
        id: 3,
        title: '新版安全管理制度发布说明',
        bgColor: '#ff6b6b', // 红色背景替代图片
        time: '2023-05-15'
      }
    ],
    projectList: [
      {
        id: 1,
        name: '安全培训项目',
        status: 'ongoing',
        progress: 45
      },
      {
        id: 2,
        name: '漏洞修复项目',
        status: 'delayed',
        progress: 60
      },
      {
        id: 3,
        name: '安全审计项目',
        status: 'completed',
        progress: 100
      }
    ],
    // 合并AI智能问答相关数据
    ...aiqa.getInitialData()
  },

  onLoad: function() {
    this.loadSecurityData()
    
    // 导入调试模块
    const debug = require('./debug.js')
    
    // 添加调试信息到控制台
    console.log('页面加载 - 检查API配置')
    debug.checkApiBaseUrl()
    
    // 将调试函数添加到页面实例，方便在控制台调用
    this.debugApi = function() {
      debug.runDebugChecks()
    }
    
    console.log('提示: 在控制台输入 Page.instance.debugApi() 运行完整调试')
  },

  onShow: function() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({
        selected: 0
      })
    }
  },

  loadSecurityData: function() {
    // TODO: 从后端API获取安全数据
    console.log('Loading security data...')
  },

  viewMoreNews: function() {
    wx.navigateTo({
      url: '/pages/news/list'
    })
  },

  viewMoreProjects: function() {
    wx.navigateTo({
      url: '/pages/projects/list'
    })
  },

  viewNewsDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/news/detail?id=${id}`
    })
  },

  viewProjectDetail: function(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/projects/detail?id=${id}`
    })
  },

  // 合并AI智能问答相关方法
  ...aiqa.getMethods()
})
