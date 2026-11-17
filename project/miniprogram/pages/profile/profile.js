const { useCampusStore } = require('../../store/campus')
const ui = require('../../utils/ui')
const tabbar = require('../../utils/tabbar')

const TASTE_OPTIONS = ['微辣 · 少糖', '不辣 · 标准糖', '中辣 · 少冰', '自定义口味']

Page({
  data: {
    statusBarHeight: 20,
    user: {},
    pointsLabel: '0',
    couponCount: 0,
    favoriteCount: 0,
    monthly: [],
    monthlyTotal: 0,
    tasteVisible: false,
    tasteActions: TASTE_OPTIONS.map(function (name) {
      return { name: name, value: name }
    }),
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
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state, store) {
      return Object.assign(
        { user: state.user || {}, couponCount: store.availableCoupons.length, favoriteCount: state.favorites.length },
        page.buildChart(state.user || {})
      )
    })

    this.store.bootstrap()
    this.prepareData()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 2, hidden: false })
    }
    if (this.store) this.refreshCounts()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  prepareData() {
    this.setData(this.buildChart(this.store.user))
    this.refreshCounts()
  },

  buildChart(user) {
    const monthlyValues = user.monthly || []
    const monthlyDays = user.monthlyDays || []
    const max = monthlyValues.length ? Math.max.apply(null, monthlyValues) : 1
    const monthly = monthlyValues.map(function (value, index) {
      return {
        value: value,
        height: Math.round((value / max) * 136) + 18,
        day: monthlyDays[index] || '',
        active: index === monthlyValues.length - 1
      }
    })
    const total = monthlyValues.reduce(function (sum, item) { return sum + item }, 0)
    return {
      monthly: monthly,
      monthlyTotal: total,
      pointsLabel: String(user.points || 0).replace(/\B(?=(\d{3})+(?!\d))/g, ',')
    }
  },

  refreshCounts() {
    this.setData({
      couponCount: this.store.availableCoupons.length,
      favoriteCount: this.store.favorites.length
    })
  },

  goService(e) {
    const url = e.currentTarget.dataset.url
    const action = e.currentTarget.dataset.action
    if (url) {
      wx.navigateTo({ url: url })
      return
    }
    if (action === 'service') {
      const page = this
      tabbar.hideTabBar(this)
      ui.alert({
        title: '宿达客服',
        message: '在线时间 08:00 - 24:00\n校园配送问题，请拨打 400-0712-326'
      }).then(function () {
        tabbar.showTabBar(page)
      }).catch(function () {
        tabbar.showTabBar(page)
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
      const notice = this.store.notifications[0]
      const page = this
      tabbar.hideTabBar(this)
      ui.alert({
        title: '消息通知',
        message: notice
          ? notice.title + '\n' + notice.desc + '\n' + notice.time
          : '你的订单正在配送中，预计 12:35 送达。\n6 元无门槛券已到账。'
      }).then(function () {
        tabbar.showTabBar(page)
      }).catch(function () {
        tabbar.showTabBar(page)
      })
      return
    }
    if (action === 'taste') {
      tabbar.hideTabBar(this)
      this.setData({ tasteVisible: true })
      return
    }
    ui.toast('功能准备中')
  },

  onSelectTaste(e) {
    tabbar.showTabBar(this)
    this.setData({ tasteVisible: false })
    ui.toast('偏好已更新：' + ((e.detail && e.detail.name) || '自定义'))
  },

  closeTaste() {
    tabbar.showTabBar(this)
    this.setData({ tasteVisible: false })
  },

  openMember() {
    const page = this
    tabbar.hideTabBar(this)
    ui.confirm({
      title: 'SUDA PRO',
      message: '本月已为你节省 ¥19.8。\n再完成 3 单，升级黑耀会员，享免配送费。',
      confirmButtonText: '去点单',
      cancelButtonText: '稍后'
    }).then(function () {
      tabbar.showTabBar(page)
      wx.switchTab({ url: '/pages/home/home' })
    }).catch(function () {
      tabbar.showTabBar(page)
    })
  },

  openBalance() {
    const page = this
    tabbar.hideTabBar(this)
    ui.alert({
      title: '宿达余额',
      message: '当前余额 ¥' + (this.data.user.balance || 0) + '\n余额可用于全平台订单支付。'
    }).then(function () {
      tabbar.showTabBar(page)
    }).catch(function () {
      tabbar.showTabBar(page)
    })
  },

  openPoints() {
    const page = this
    tabbar.hideTabBar(this)
    ui.confirm({
      title: '宿达积分',
      message: '当前积分 ' + this.data.pointsLabel + '\n100 积分可兑换 1 元无门槛红包。',
      confirmButtonText: '去兑换',
      cancelButtonText: '稍后'
    }).then(function () {
      tabbar.showTabBar(page)
      ui.toast('积分商城准备中')
    }).catch(function () {
      tabbar.showTabBar(page)
    })
  },

  openSettings() {
    wx.navigateTo({ url: '/pages/settings/settings' })
  }
})
