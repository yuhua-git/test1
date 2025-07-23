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
      // 模拟数据
      const mockProjects = [
        {
          id: 1,
          name: '安全测评项目A',
          status: 'evaluating',
          startTime: '2024-01-15',
          expectedEndTime: '2024-02-15',
          stepProgress: 15
        },
        {
          id: 2,
          name: '安全测评项目B',
          status: 'report_drafting',
          startTime: '2024-01-10',
          expectedEndTime: '2024-02-10',
          stepProgress: 20
        },
        {
          id: 3,
          name: '安全测评项目C',
          status: 'report_reviewing',
          startTime: '2024-01-05',
          expectedEndTime: '2024-02-05',
          stepProgress: 10
        },
        {
          id: 4,
          name: '安全测评项目D',
          status: 'delivering',
          startTime: '2024-01-01',
          expectedEndTime: '2024-02-01',
          stepProgress: 5
        },
        {
          id: 5,
          name: '安全测评项目E',
          status: 'completed',
          startTime: '2023-12-01',
          expectedEndTime: '2024-01-01',
          stepProgress: 25
        }
      ]

      // 根据搜索关键词过滤
      const filteredProjects = this.data.searchKeyword
        ? mockProjects.filter(p => p.name.toLowerCase().includes(this.data.searchKeyword.toLowerCase()))
        : mockProjects

      // 处理项目数据
      const projectList = filteredProjects.map(project => {
        const status = this.data.statusMap[project.status] || { text: '未知状态', index: -1 }
        return {
          ...project,
          statusText: status.text,
          currentStepIndex: status.index,
          progress: this.calculateProgress(project, status.index)
        }
      })

      this.setData({ projectList })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
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