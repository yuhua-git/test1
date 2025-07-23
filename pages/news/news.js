Page({
  data: {
    newsList: [],
    loading: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.loadNewsList()
  },

  onPullDownRefresh() {
    this.setData({
      page: 1,
      hasMore: true,
      newsList: []
    })
    this.loadNewsList().then(() => {
      wx.stopPullDownRefresh()
    })
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadNewsList()
    }
  },

  async loadNewsList() {
    if (this.data.loading) return
    
    this.setData({ loading: true })
    try {
      // TODO: 替换为实际的API接口
      const response = await wx.cloud.callFunction({
        name: 'getNewsList',
        data: {
          page: this.data.page,
          pageSize: 10
        }
      })

      const { data, hasMore } = response.result
      this.setData({
        newsList: [...this.data.newsList, ...data],
        page: this.data.page + 1,
        hasMore
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  goToDetail(e) {
    const { id } = e.currentTarget.dataset
    wx.navigateTo({
      url: `/pages/news-detail/news-detail?id=${id}`
    })
  }
})