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
    projectList: [],
    // 合并AI智能问答相关数据
    ...aiqa.getInitialData()
  },

  onLoad: function() {
    this.loadSecurityData()
    this.loadProjectData()
    
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

  loadProjectData: function() {
    const app = getApp()
    const apiBaseUrl = app.globalData.apiBaseUrl
    // 项目API使用8002端口
    const projectApiUrl = apiBaseUrl.replace(':8001', ':8002')
    
    wx.request({
      url: `${projectApiUrl}/api/projects/list`,
      method: 'GET',
      data: {
        page: 1,
        page_size: 3  // 首页只显示3个项目
      },
      success: (res) => {
        console.log('项目数据获取成功:', res.data)
        if (res.data && res.data.projects) {
          // 转换数据格式以适配首页显示
          const projects = res.data.projects.map(project => {
            // 状态映射
            let statusText = ''
            let statusClass = ''
            switch(project.status) {
              case 'evaluating':
                statusText = '测评中'
                statusClass = 'ongoing'
                break
              case 'report_drafting':
                statusText = '报告编制中'
                statusClass = 'ongoing'
                break
              case 'report_reviewing':
                statusText = '报告审核中'
                statusClass = 'ongoing'
                break
              case 'delivering':
                statusText = '交付中'
                statusClass = 'ongoing'
                break
              case 'completed':
                statusText = '已完成'
                statusClass = 'completed'
                break
              case 'delayed':
                statusText = '延期'
                statusClass = 'delayed'
                break
              default:
                statusText = '未知'
                statusClass = 'unknown'
            }
            
            return {
              id: project.id,
              name: project.name,
              status: statusClass,
              statusText: statusText,
              progress: project.progress || 0
            }
          })
          
          this.setData({
            projectList: projects
          })
        }
      },
      fail: (err) => {
        console.error('项目数据获取失败:', err)
        // 使用备用数据
        this.setData({
          projectList: [
            {
              id: 1,
              name: '安全培训项目',
              status: 'ongoing',
              statusText: '进行中',
              progress: 45
            },
            {
              id: 2,
              name: '漏洞修复项目',
              status: 'delayed',
              statusText: '延期',
              progress: 60
            },
            {
              id: 3,
              name: '安全审计项目',
              status: 'completed',
              statusText: '已完成',
              progress: 100
            }
          ]
        })
      }
    })
  },

  viewMoreNews: function() {
    wx.navigateTo({
      url: '/pages/news/list'
    })
  },

  viewMoreProjects: function() {
    console.log('点击了查看更多按钮，准备跳转到项目页面')
    wx.switchTab({
      url: '/pages/project/project',
      success: function() {
        console.log('跳转成功')
      },
      fail: function(err) {
        console.error('跳转失败:', err)
        wx.showToast({
          title: '页面跳转失败',
          icon: 'none'
        })
      }
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
