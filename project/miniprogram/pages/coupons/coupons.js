const mock = require('../../data/mock')

Page({
  data: {
    statusBarHeight: 20,
    tabs: [
      { id: 'available', label: '可使用', count: 0 },
      { id: 'used', label: '已使用', count: 0 },
      { id: 'expired', label: '已过期', count: 0 }
    ],
    activeTab: 'available',
    coupons: [],
    totalSave: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadCoupons()
  },

  loadCoupons() {
    const counts = {
      available: mock.coupons.filter(function (item) { return item.status === 'available' }).length,
      used: mock.coupons.filter(function (item) { return item.status === 'used' }).length,
      expired: mock.coupons.filter(function (item) { return item.status === 'expired' }).length
    }
    const tabs = this.data.tabs.map(function (tab) {
      return Object.assign({}, tab, { count: counts[tab.id] })
    })
    const coupons = mock.coupons.filter(function (item) { return item.status === this.data.activeTab }, this)
    const totalSave = mock.coupons
      .filter(function (item) { return item.status === 'available' })
      .reduce(function (sum, item) { return sum + item.amount }, 0)

    this.setData({ tabs: tabs, coupons: coupons, totalSave: totalSave })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  switchTab(e) {
    this.setData({ activeTab: e.currentTarget.dataset.id })
    this.loadCoupons()
  },

  useCoupon(e) {
    const id = e.currentTarget.dataset.id
    const coupon = mock.coupons.find(function (item) { return item.id === id })
    if (!coupon) return
    try { wx.setStorageSync('suda_selected_coupon_v1', coupon) } catch (e) {}
    wx.showToast({ title: '已放入本次订单', icon: 'none' })
    setTimeout(function () {
      wx.switchTab({ url: '/pages/home/home' })
    }, 500)
  },

  claimMore() {
    wx.showModal({
      title: '领券中心',
      content: '本周还有 2 张校园专享券可领。\n完成学生认证后自动到账。',
      confirmText: '知道了',
      showCancel: false
    })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
