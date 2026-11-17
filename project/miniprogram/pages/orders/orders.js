const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')
const tabbar = require('../../utils/tabbar')

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
    reviewText: '',
    dataSource: 'mock'
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state) {
      const all = page.store.allOrders
      const counts = {
        all: all.length,
        ongoing: all.filter(function (item) {
          return item.status === 'delivering' || item.status === 'preparing'
        }).length,
        review: all.filter(function (item) { return item.status === 'done' }).length
      }
      const tabs = page.data.tabs.map(function (tab) {
        return Object.assign({}, tab, { count: counts[tab.id] })
      })
      return {
        allOrders: all,
        counts: counts,
        tabs: tabs,
        dataSource: state.dataSource
      }
    })

    this.store.bootstrap()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 1, hidden: false })
    }
    this.loadOrders()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadOrders() {
    const all = this.store.allOrders
    const counts = {
      all: all.length,
      ongoing: all.filter(function (item) {
        return item.status === 'delivering' || item.status === 'preparing'
      }).length,
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
      list = all.filter(function (item) {
        return item.status === 'delivering' || item.status === 'preparing'
      })
    } else if (tab === 'review') {
      list = all.filter(function (item) { return item.status === 'done' })
    }

    let activeOrder = null
    if (tab !== 'review') {
      activeOrder = list.find(function (item) {
        return item.status === 'delivering' || item.status === 'preparing'
      }) || null
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
    const page = this
    tabbar.hideTabBar(this)
    ui.alert({
      title: '联系骑手',
      message: order.rider.name + '  ' + order.rider.phone + '\n正在为你飞奔，请耐心等待。'
    }).then(function () {
      tabbar.showTabBar(page)
    }).catch(function () {
      tabbar.showTabBar(page)
    })
  },

  reorder(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.allOrders.find(function (item) { return item.id === id })
    if (!order) return
    const shop = this.store.merchants.find(function (item) { return item.id === order.shopId }) || this.store.merchants[0]
    if (!shop) {
      ui.toast('店铺暂不可用')
      return
    }
    cartUtil.clearCart()
    order.items.forEach(function (item, index) {
      const dish = shop.dishes.find(function (d) { return d.name === item.name }) || shop.dishes[index] || shop.dishes[0]
      cartUtil.addItem(dish, shop, item.qty)
    })
    ui.toast('已加入购物车')
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/cart/cart' })
    }, 500)
  },

  openReview(e) {
    const id = e.currentTarget.dataset.id
    const order = this.data.allOrders.find(function (item) { return item.id === id })
    tabbar.hideTabBar(this)
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
    tabbar.showTabBar(this)
    this.setData({ reviewVisible: false })
  },

  noop() {},

  onRateChange(e) {
    this.setData({ reviewStars: Number(e.detail) })
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

  onReviewChange(e) {
    this.setData({ reviewText: e.detail || '' })
  },

  submitReview() {
    const order = this.data.reviewOrder
    if (!order) return
    this.store.markReviewed(order.id)
    tabbar.showTabBar(this)
    this.setData({ reviewVisible: false })
    ui.toast('感谢你的认真评价')
    this.loadOrders()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
