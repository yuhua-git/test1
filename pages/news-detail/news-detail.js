Page({
  data: {
    newsDetail: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options
    this.loadNewsDetail(id)
  },

  async loadNewsDetail(id) {
    try {
      // TODO: 替换为实际的API接口
      const response = await wx.cloud.callFunction({
        name: 'getNewsDetail',
        data: { id }
      })

      this.setData({
        newsDetail: response.result,
        loading: false
      })
    } catch (error) {
      wx.showToast({
        title: '加载失败',
        icon: 'none'
      })
      this.setData({ loading: false })
    }
  },

  onShareAppMessage() {
    const { newsDetail } = this.data
    return {
      title: newsDetail?.title || '行业资讯',
      path: `/pages/news-detail/news-detail?id=${newsDetail?.id}`
    }
  },

  onShareTimeline() {
    const { newsDetail } = this.data
    return {
      title: newsDetail?.title || '行业资讯',
      query: `id=${newsDetail?.id}`
    }
  }
})