const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

const HISTORY_KEY = 'suda_search_history_v1'

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    history: [],
    hotSearches: mock.hotSearches,
    results: [],
    dishes: [],
    searched: false,
    resultCount: 0,
    inspiration: mock.merchants[0]
  },

  onLoad() {
    let history = []
    try {
      history = wx.getStorageSync(HISTORY_KEY) || []
    } catch (e) {}
    if (!history.length) history = mock.searchHistory.slice()
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      history: history
    })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  onInput(e) {
    const keyword = e.detail.value
    this.setData({ keyword: keyword })
    if (keyword.trim()) {
      this.performSearch(keyword.trim(), false)
    } else {
      this.setData({ results: [], dishes: [], searched: false, resultCount: 0 })
    }
  },

  clearInput() {
    this.setData({ keyword: '', results: [], dishes: [], searched: false, resultCount: 0 })
  },

  doSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    this.performSearch(keyword, true)
  },

  performSearch(keyword, save) {
    const lower = keyword.toLowerCase()
    const merchants = mock.merchants.filter(function (shop) {
      const text = [shop.name, shop.en, shop.tags.join(' '), shop.hot.join(' '), shop.address].join(' ').toLowerCase()
      return text.indexOf(lower) > -1
    })
    const dishes = []
    mock.merchants.forEach(function (shop) {
      shop.dishes.forEach(function (dish) {
        if ((dish.name + dish.desc).toLowerCase().indexOf(lower) > -1) {
          dishes.push(Object.assign({}, dish, { shopId: shop.id, shopName: shop.name, shop: shop }))
        }
      })
    })

    this.setData({
      results: merchants,
      dishes: dishes.slice(0, 4),
      searched: true,
      resultCount: merchants.length + dishes.length
    })

    if (save) {
      this.saveHistory(keyword)
    }
  },

  saveHistory(keyword) {
    let history = this.data.history.filter(function (item) { return item !== keyword })
    history.unshift(keyword)
    history = history.slice(0, 8)
    this.setData({ history: history })
    try {
      wx.setStorageSync(HISTORY_KEY, history)
    } catch (e) {}
  },

  useKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword: keyword })
    this.performSearch(keyword, true)
  },

  clearHistory() {
    const self = this
    wx.showModal({
      title: '清空搜索历史',
      content: '确定清空全部搜索记录吗？',
      confirmColor: '#18211a',
      success: function (res) {
        if (!res.confirm) return
        self.setData({ history: [] })
        try {
          wx.setStorageSync(HISTORY_KEY, [])
        } catch (e) {}
      }
    })
  },

  goShop(e) {
    wx.navigateTo({ url: '/pages/shop/shop?id=' + e.currentTarget.dataset.id })
  },

  quickAdd(e) {
    const shop = e.detail.merchant
    if (!shop) return
    const result = cartUtil.addItem(shop.dishes[0], shop)
    wx.showToast({ title: result.cleared ? '已切换店铺并加入' : '已加入购物车', icon: 'none' })
  },

  addDish(e) {
    const shopId = e.currentTarget.dataset.shopid
    const dishId = e.currentTarget.dataset.dishid
    const shop = mock.merchants.find(function (item) { return item.id === shopId })
    if (!shop) return
    const dish = shop.dishes.find(function (item) { return item.id === dishId })
    if (!dish) return
    const result = cartUtil.addItem(dish, shop)
    wx.showToast({ title: result.cleared ? '已切换店铺并加入' : '已加入购物车', icon: 'none' })
  },

  surprise() {
    const list = mock.merchants
    const shop = list[Math.floor(Math.random() * list.length)]
    wx.showToast({ title: '今天吃 ' + shop.name, icon: 'none' })
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/shop/shop?id=' + shop.id })
    }, 500)
  }
})
