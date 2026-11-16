const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

Page({
  data: {
    statusBarHeight: 20,
    categories: mock.categories,
    activeCategory: 'all',
    merchants: mock.merchants,
    visibleMerchants: mock.merchants,
    hotMerchants: mock.merchants.slice(0, 4),
    featureShop: mock.merchants[0],
    greeting: '中午好',
    cartCount: 0,
    cartTotal: '0.00',
    cartShopName: ''
  },

  onLoad() {
    const app = getApp()
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      greeting: this.getGreeting()
    })
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0 })
    }
    this.refreshCart()
  },

  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 10) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  },

  refreshCart() {
    const summary = cartUtil.summary()
    this.setData({
      cartCount: summary.count,
      cartTotal: summary.subtotal.toFixed(2),
      cartShopName: summary.shopName
    })
  },

  selectCategory(e) {
    const id = e.currentTarget.dataset.id
    const list = id === 'all'
      ? mock.merchants
      : mock.merchants.filter(function (shop) { return shop.category.indexOf(id) > -1 })
    this.setData({
      activeCategory: id,
      visibleMerchants: list
    })
    if (id !== 'all' && !list.length) {
      wx.showToast({ title: '该分类正在上新', icon: 'none' })
    }
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goShop(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/shop/shop?id=' + id })
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  goCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' })
  },

  goNotifications() {
    wx.showToast({ title: '暂无新消息', icon: 'none' })
  },

  goLocation() {
    wx.showActionSheet({
      itemList: ['北苑 7 号楼', '图书馆 3F', '南门文创街'],
      success: (res) => {
        const places = ['北苑 7 号楼', '图书馆 3F', '南门文创街']
        wx.showToast({ title: '已切换至 ' + places[res.tapIndex], icon: 'none' })
      }
    })
  },

  addFromCard(e) {
    const shop = e.detail.merchant
    const dish = shop.dishes[0]
    const result = cartUtil.addItem(dish, shop)
    this.refreshCart()
    wx.showToast({
      title: result.cleared ? '已切换店铺并加入购物车' : '已加入购物车',
      icon: 'none'
    })
  },

  addFeature() {
    const shop = this.data.featureShop
    cartUtil.addItem(shop.dishes[0], shop)
    this.refreshCart()
    wx.showToast({ title: '已加入购物车', icon: 'none' })
  },

  onShareAppMessage() {
    return {
      title: '校园宿达 · 把好吃的送到宿舍楼下',
      path: '/pages/home/home'
    }
  }
})
