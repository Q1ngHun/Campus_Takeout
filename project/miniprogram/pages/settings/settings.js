Page({
  data: {
    statusBarHeight: 20,
    notify: true,
    sound: true,
    location: true,
    personalized: false,
    cacheSize: '12.6 MB'
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  toggle(e) {
    const field = e.currentTarget.dataset.field
    const value = e.detail.value
    const update = {}
    update[field] = value
    this.setData(update)
  },

  clearCache() {
    const self = this
    wx.showModal({
      title: '清除缓存',
      content: '将清除搜索记录与临时缓存，不影响订单与地址。',
      confirmColor: '#18211a',
      success: function (res) {
        if (!res.confirm) return
        try {
          wx.removeStorageSync('suda_search_history_v1')
        } catch (e) {}
        self.setData({ cacheSize: '0.0 MB' })
        wx.showToast({ title: '缓存已清除', icon: 'none' })
      }
    })
  },

  showAbout() {
    wx.showModal({
      title: '关于校园宿达',
      content: '校园宿达 1.0.0\n把好吃的，送到宿舍楼下。\n\n这是一份来自校园的味觉提案。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  showAgreement() {
    wx.showModal({
      title: '服务协议与隐私',
      content: '校园宿达仅用于校园场景演示。所有数据均保存在本地，不会上传至服务器。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  contactService() {
    wx.showModal({
      title: '联系客服',
      content: '在线时间 08:00 - 24:00\n校园配送专线：400-0712-326',
      confirmText: '知道了',
      showCancel: false
    })
  },

  logout() {
    const self = this
    wx.showModal({
      title: '退出登录',
      content: '退出后本地购物车和收藏仍会保留。',
      confirmColor: '#18211a',
      success: function (res) {
        if (!res.confirm) return
        wx.showToast({ title: '已退出登录', icon: 'none' })
        setTimeout(function () {
          wx.switchTab({ url: '/pages/profile/profile' })
        }, 600)
      }
    })
  }
})
