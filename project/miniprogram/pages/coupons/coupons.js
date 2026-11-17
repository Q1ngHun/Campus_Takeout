const { useCampusStore } = require('../../store/campus')
const ui = require('../../utils/ui')

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
    totalSave: 0,
    dataSource: 'mock'
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadCoupons()

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state) {
      return {
        dataSource: state.dataSource,
        totalSave: page.sumAvailable(state.coupons || [])
      }
    })
    this.store.bootstrap()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  sumAvailable(list) {
    return list
      .filter(function (item) { return item.status === 'available' })
      .reduce(function (sum, item) { return sum + item.amount }, 0)
  },

  loadCoupons() {
    const list = this.store.coupons
    const counts = {
      available: list.filter(function (item) { return item.status === 'available' }).length,
      used: list.filter(function (item) { return item.status === 'used' }).length,
      expired: list.filter(function (item) { return item.status === 'expired' }).length
    }
    const tabs = this.data.tabs.map(function (tab) {
      return Object.assign({}, tab, { count: counts[tab.id] })
    })
    const activeTab = this.data.activeTab
    const coupons = list.filter(function (item) { return item.status === activeTab })
    this.setData({
      tabs: tabs,
      coupons: coupons,
      totalSave: this.sumAvailable(list)
    })
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
    const coupon = this.store.coupons.find(function (item) { return item.id === id })
    if (!coupon) return
    this.store.selectCoupon(coupon)
    ui.toast('已放入本次订单')
    setTimeout(function () {
      wx.switchTab({ url: '/pages/home/home' })
    }, 500)
  },

  claimMore() {
    const page = this
    ui.confirm({
      title: '领券中心',
      message: '本周还有 2 张校园专享券可领。\n完成学生认证后自动到账。',
      showCancelButton: false,
      confirmButtonText: '知道了'
    }).then(function () {
      page.store.refreshCoupons()
      page.loadCoupons()
    }).catch(function () {})
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
