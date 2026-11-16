const mock = require('../../data/mock')

Page({
  data: {
    statusBarHeight: 20,
    user: mock.user,
    pointsLabel: '1,280',
    couponCount: 0,
    favoriteCount: 0,
    monthly: [],
    monthlyTotal: 0,
    services: [
      { name: '地址管理', icon: 'address', tone: 'lime', url: '/pages/addresses/addresses' },
      { name: '优惠券', icon: 'coupon', tone: 'peach', url: '/pages/coupons/coupons' },
      { name: '我的收藏', icon: 'heart', tone: 'rose', url: '/pages/favorites/favorites' },
      { name: '联系客服', icon: 'headset', tone: 'mint', action: 'service' }
    ],
    more: [
      { name: '我的评价', icon: 'star', desc: '3 条待评价', action: 'review' },
      { name: '消息通知', icon: 'bell', desc: '2 条未读', action: 'notice' },
      { name: '口味偏好', icon: 'leaf', desc: '微辣 · 少糖', action: 'taste' },
      { name: '设置', icon: 'settings', desc: '', url: '/pages/settings/settings' }
    ]
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.prepareData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2 })
    }
    this.refreshCounts()
  },

  prepareData() {
    const max = Math.max.apply(null, mock.user.monthly)
    const monthly = mock.user.monthly.map(function (value, index) {
      return {
        value: value,
        height: Math.round((value / max) * 136) + 18,
        day: mock.user.monthlyDays[index],
        active: index === mock.user.monthly.length - 1
      }
    })
    const total = mock.user.monthly.reduce(function (sum, item) { return sum + item }, 0)
    const pointsLabel = mock.user.points.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    this.setData({ monthly: monthly, monthlyTotal: total, pointsLabel: pointsLabel })
  },

  refreshCounts() {
    let coupons = mock.coupons.filter(function (item) { return item.status === 'available' })
    try {
      const favorites = wx.getStorageSync('suda_favorites_v1')
      if (Array.isArray(favorites)) {
        this.setData({ favoriteCount: favorites.length })
      } else {
        this.setData({ favoriteCount: 3 })
      }
    } catch (e) {
      this.setData({ favoriteCount: 3 })
    }
    this.setData({ couponCount: coupons.length })
  },

  goService(e) {
    const url = e.currentTarget.dataset.url
    const action = e.currentTarget.dataset.action
    if (url) {
      wx.navigateTo({ url: url })
      return
    }
    if (action === 'service') {
      wx.showModal({
        title: '宿达客服',
        content: '在线时间 08:00 - 24:00\n校园配送问题，请拨打 400-0712-326',
        confirmText: '知道了',
        showCancel: false
      })
    }
  },

  handleMore(e) {
    const action = e.currentTarget.dataset.action
    const url = e.currentTarget.dataset.url
    if (url) {
      wx.navigateTo({ url: url })
      return
    }
    if (action === 'review') {
      wx.switchTab({ url: '/pages/orders/orders' })
      return
    }
    if (action === 'notice') {
      wx.showModal({
        title: '消息通知',
        content: '你的订单正在配送中，预计 12:35 送达。\n6 元无门槛券已到账。',
        showCancel: false,
        confirmText: '知道了'
      })
      return
    }
    if (action === 'taste') {
      wx.showActionSheet({
        itemList: ['微辣 · 少糖', '不辣 · 标准糖', '中辣 · 少冰', '自定义口味'],
        success: function (res) {
          wx.showToast({ title: '偏好已更新', icon: 'none' })
        }
      })
      return
    }
    wx.showToast({ title: '功能准备中', icon: 'none' })
  },

  openMember() {
    wx.showModal({
      title: 'SUDA PRO',
      content: '本月已为你节省 ¥19.8。\n再完成 3 单，升级黑耀会员，享免配送费。',
      confirmText: '去点单',
      cancelText: '稍后',
      success: function (res) {
        if (res.confirm) wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  openBalance() {
    wx.showModal({
      title: '宿达余额',
      content: '当前余额 ¥36.50\n余额可用于全平台订单支付。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  openPoints() {
    wx.showModal({
      title: '宿达积分',
      content: '当前积分 1,280\n100 积分可兑换 1 元无门槛红包。',
      confirmText: '去兑换',
      success: function (res) {
        if (res.confirm) wx.showToast({ title: '积分商城准备中', icon: 'none' })
      }
    })
  },

  openSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
