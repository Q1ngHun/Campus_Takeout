const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

const REVIEW_KEY = 'suda_reviews_v1'
const REVIEW_OPTIONS = ['准时送达', '包装完好', '味道超赞', '分量很足', '骑手有礼貌']

function buildReviewOptions(selected) {
  return REVIEW_OPTIONS.map(function (name) {
    return {
      name: name,
      active: (selected || ['准时送达', '包装完好', '味道超赞']).indexOf(name) > -1
    }
  })
}

Page({
  data: {
    statusBarHeight: 20,
    tabs: [
      { id: 'all', label: '全部', count: 0 },
      { id: 'ongoing', label: '进行中', count: 0 },
      { id: 'review', label: '待评价', count: 0 }
    ],
    activeTab: 'all',
    allOrders: [],
    displayOrders: [],
    activeOrder: null,
    counts: { all: 0, ongoing: 0, review: 0 },
    reviewVisible: false,
    reviewOrder: null,
    reviewStars: 5,
    reviewTags: ['准时送达', '包装完好', '味道超赞'],
    reviewOptions: buildReviewOptions(),
    reviewStarList: [1, 2, 3, 4, 5],
    reviewText: ''
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1 })
    }
    this.loadOrders()
  },

  loadOrders() {
    let saved = []
    try {
      saved = wx.getStorageSync('suda_orders_v1') || []
    } catch (e) {
      saved = []
    }
    let reviewed = []
    try {
      reviewed = wx.getStorageSync(REVIEW_KEY) || []
    } catch (e) {
      reviewed = []
    }

    const all = saved.concat(mock.orders).map(function (order) {
      if (reviewed.indexOf(order.id) > -1 && order.status === 'done') {
        return Object.assign({}, order, { status: 'rated', statusText: '已完成' })
      }
      return order
    })

    const counts = {
      all: all.length,
      ongoing: all.filter(function (item) { return item.status === 'delivering' || item.status === 'preparing' }).length,
      review: all.filter(function (item) { return item.status === 'done' }).length
    }
    const tabs = this.data.tabs.map(function (tab) {
      return Object.assign({}, tab, { count: counts[tab.id] })
    })

    this.setData({ allOrders: all, counts: counts, tabs: tabs })
    this.applyFilter(this.data.activeTab, all)
  },

  applyFilter(tab, source) {
    const all = source || this.data.allOrders
    let list = all
    if (tab === 'ongoing') {
      list = all.filter(function (item) { return item.status === 'delivering' || item.status === 'preparing' })
    } else if (tab === 'review') {
      list = all.filter(function (item) { return item.status === 'done' })
    }

    let activeOrder = null
    if (tab !== 'review') {
      activeOrder = list.find(function (item) { return item.status === 'delivering' || item.status === 'preparing' }) || null
    }
    const displayOrders = activeOrder
      ? list.filter(function (item) { return item.id !== activeOrder.id })
      : list

    this.setData({
      activeTab: tab,
      activeOrder: activeOrder,
      displayOrders: displayOrders
    })
  },

  switchTab(e) {
    this.applyFilter(e.currentTarget.dataset.id)
  },

  goDetail(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/order-detail/order-detail?id=' + id })
  },

  contactRider() {
    const order = this.data.activeOrder
    if (!order) return
    wx.showModal({
      title: '联系骑手',
      content: order.rider.name + '  ' + order.rider.phone + '\n正在为你飞奔，请耐心等待。',
      confirmText: '知道了',
      showCancel: false
    })
  },

  reorder(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.allOrders.find(function (item) { return item.id === id })
    if (!order) return
    const shop = mock.merchants.find(function (item) { return item.id === order.shopId }) || mock.merchants[0]
    cartUtil.clearCart()
    order.items.forEach(function (item, index) {
      const dish = shop.dishes.find(function (d) { return d.name === item.name }) || shop.dishes[index] || shop.dishes[0]
      cartUtil.addItem(dish, shop, item.qty)
    })
    wx.showToast({ title: '已加入购物车', icon: 'none' })
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/cart/cart' })
    }, 500)
  },

  openReview(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.allOrders.find(function (item) { return item.id === id })
    this.setData({
      reviewVisible: true,
      reviewOrder: order,
      reviewStars: 5,
      reviewTags: ['准时送达', '包装完好', '味道超赞'],
      reviewOptions: buildReviewOptions(),
      reviewText: ''
    })
  },

  closeReview() {
    this.setData({ reviewVisible: false })
  },

  noop() {},

  setStar(e) {
    this.setData({ reviewStars: Number(e.currentTarget.dataset.value) })
  },

  toggleReviewTag(e) {
    const tag = e.currentTarget.dataset.tag
    const tags = this.data.reviewTags.slice()
    const index = tags.indexOf(tag)
    if (index > -1) {
      tags.splice(index, 1)
    } else {
      tags.push(tag)
    }
    this.setData({
      reviewTags: tags,
      reviewOptions: buildReviewOptions(tags)
    })
  },

  onReviewInput(e) {
    this.setData({ reviewText: e.detail.value })
  },

  submitReview() {
    const order = this.data.reviewOrder
    if (!order) return
    let reviewed = []
    try {
      reviewed = wx.getStorageSync(REVIEW_KEY) || []
    } catch (e) {}
    if (reviewed.indexOf(order.id) === -1) reviewed.push(order.id)
    try {
      wx.setStorageSync(REVIEW_KEY, reviewed)
    } catch (e) {}
    this.setData({ reviewVisible: false })
    wx.showToast({ title: '感谢你的认真评价', icon: 'none' })
    this.loadOrders()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
