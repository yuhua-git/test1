Page({
  data: {
    projectList: [],
    loading: false,
    userInfo: null,
    isLogin: false,
    searchKeyword: '',
    statusSteps: ['测评中', '报告编制中', '报告审核中', '交付中', '已完成'],
    statusMap: {
      'evaluating': { text: '测评中', index: 0 },
      'report_drafting': { text: '报告编制中', index: 1 },
      'report_reviewing': { text: '报告审核中', index: 2 },
      'delivering': { text: '交付中', index: 3 },
      'completed': { text: '已完成', index: 4 }
    }
  },

  onLoad() {
    this.checkLoginStatus()
  },

  onShow() {
    if (this.data.isLogin) {
      this.loadProjectList()
    }
  },

  onPullDownRefresh() {
    if (this.data.isLogin) {
      this.loadProjectList().then(() => {
        wx.stopPullDownRefresh()
      })
    } else {
      wx.stopPullDownRefresh()
    }
    
  },

  async checkLoginStatus() {
    try {
      const userInfo = await wx.getStorageSync('userInfo')
      if (userInfo) {
        this.setData({
          userInfo,
          isLogin: true
        })
        this.loadProjectList()
      }
    } catch (error) {
      console.error('检查登录状态失败', error)
    }
  },

  async loadProjectList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    try {
      const app = getApp()
      const apiBaseUrl = app.globalData.apiBaseUrl
      // 项目API使用8002端口
      const projectApiUrl = apiBaseUrl.replace(':8001', ':8002')
      
      // 构建请求参数
      const params = {
        page: 1,
        page_size: 20
      }
      
      // 添加搜索关键词
      if (this.data.searchKeyword) {
        params.keyword = this.data.searchKeyword
      }
      
      // 构建查询字符串
      const queryString = Object.keys(params)
        .map(key => `${key}=${encodeURIComponent(params[key])}`)
        .join('&')
      
      // 调用API获取项目列表
      const response = await new Promise((resolve, reject) => {
        wx.request({
          url: `${projectApiUrl}/api/projects/list?${queryString}`,
          method: 'GET',
          timeout: app.globalData.apiTimeout,
          success: resolve,
          fail: reject
        })
      })
      
      if (response.statusCode === 200) {
        const { projects } = response.data
        
        // 处理项目数据，添加小程序需要的字段
        const projectList = projects.map(project => {
          return {
            id: project.id,
            name: project.name,
            status: project.status,
            statusText: project.statusText,
            startTime: project.startTime,
            expectedEndTime: project.expectedEndTime,
            actualEndTime: project.actualEndTime,
            progress: project.progress,
            stepProgress: project.stepProgress,
            totalTasks: project.totalTasks,
            completedTasks: project.completedTasks,
            updateTime: project.updateTime,
            currentStepIndex: project.currentStepIndex,
            clientName: project.clientName,
            projectManager: project.projectManager,
            description: project.description
          }
        })
        
        this.setData({ projectList })
      } else {
        throw new Error(`API请求失败: ${response.statusCode}`)
      }
    } catch (error) {
      console.error('加载项目列表失败:', error)
      
      // 如果API调用失败，使用模拟数据作为后备
      console.log('使用模拟数据作为后备')
      const mockProjects = [
        {
          id: 1,
          name: '安全测评项目A',
          status: 'evaluating',
          statusText: '测评中',
          startTime: '2024-01-15',
          expectedEndTime: '2024-02-15',
          progress: 15,
          stepProgress: 15,
          totalTasks: 20,
          completedTasks: 3,
          updateTime: '2024-01-20 10:30',
          currentStepIndex: 0
        },
        {
          id: 2,
          name: '安全测评项目B',
          status: 'report_drafting',
          statusText: '报告编制中',
          startTime: '2024-01-10',
          expectedEndTime: '2024-02-10',
          progress: 45,
          stepProgress: 20,
          totalTasks: 25,
          completedTasks: 18,
          updateTime: '2024-01-20 14:15',
          currentStepIndex: 1
        }
      ]
      
      // 根据搜索关键词过滤模拟数据
      const filteredProjects = this.data.searchKeyword
        ? mockProjects.filter(p => p.name.toLowerCase().includes(this.data.searchKeyword.toLowerCase()))
        : mockProjects
      
      this.setData({ projectList: filteredProjects })
      
      wx.showToast({
        title: '网络异常，显示离线数据',
        icon: 'none',
        duration: 2000
      })
    } finally {
      this.setData({ loading: false })
      wx.stopPullDownRefresh()
    }
  },

  calculateProgress(project, stepIndex) {
    if (stepIndex === -1) return 0
    if (stepIndex === 4) return 100
    
    // 每个步骤的基础进度
    const baseProgress = stepIndex * 25
    
    // 当前步骤的额外进度（0-25之间）
    let stepProgress = 0
    if (project.stepProgress) {
      stepProgress = Math.min(Math.max(project.stepProgress, 0), 25)
    }
    
    return Math.min(baseProgress + stepProgress, 100)
  },

  async handleLogin() {
    try {
      // 模拟用户信息
      const mockUserInfo = {
        nickName: '测试用户',
        avatarUrl: '/images/profile.png',
        id: 'test_user_001'
      }

      wx.setStorageSync('userInfo', mockUserInfo)
      
      this.setData({
        userInfo: mockUserInfo,
        isLogin: true
      })

      this.loadProjectList()

      wx.showToast({
        title: '登录成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('登录失败', error)
      if (error.errMsg !== 'getUserProfile:fail auth deny') {
        wx.showToast({
          title: '登录失败',
          icon: 'none'
        })
      }
    }
  },

  onSearchInput(e) {
    this.setData({
      searchKeyword: e.detail.value
    })
  },

  handleSearch() {
    this.loadProjectList()
  },

  viewProjectDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/project-detail/project-detail?id=${id}`
    })
  }
})