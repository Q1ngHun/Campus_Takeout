const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')

Page({
  data: {
    statusBarHeight: 20,
    keyword: '',
    history: [],
    hotSearches: [],
    results: [],
    dishes: [],
    searched: false,
    searching: false,
    resultCount: 0,
    dataSource: 'mock',
    inspiration: null
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      history: this.store.searchHistory,
      hotSearches: this.store.hotSearches,
      inspiration: this.store.merchants[0] || null
    })

    this.unsubscribe = this.store.$bind(this, function (state) {
      return {
        hotSearches: state.hotSearches || [],
        history: state.searchHistory || [],
        inspiration: (state.merchants || [])[0] || null
      }
    })

    this.store.bootstrap()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
    if (this.searchTimer) clearTimeout(this.searchTimer)
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  onSearchChange(e) {
    const keyword = typeof e.detail === 'string' ? e.detail : e.detail.value
    this.setData({ keyword: keyword })
    if (this.searchTimer) clearTimeout(this.searchTimer)
    if (!keyword.trim()) {
      this.setData({ results: [], dishes: [], searched: false, searching: false, resultCount: 0 })
      return
    }
    const page = this
    this.searchTimer = setTimeout(function () {
      page.performSearch(keyword.trim(), false)
    }, 280)
  },

  clearInput() {
    this.setData({ keyword: '', results: [], dishes: [], searched: false, searching: false, resultCount: 0 })
  },

  doSearch() {
    const keyword = this.data.keyword.trim()
    if (!keyword) return
    this.performSearch(keyword, true)
  },

  performSearch(keyword, save) {
    const page = this
    this.setData({ searching: true })
    return this.store.search(keyword).then(function (result) {
      page.setData({
        results: result.merchants || [],
        dishes: (result.dishes || []).slice(0, 4),
        searched: true,
        searching: false,
        resultCount: result.count || 0,
        dataSource: result.source || 'mock'
      })
      if (save) page.saveHistory(keyword)
      return result
    }).catch(function () {
      page.setData({ searching: false, searched: true })
    })
  },

  saveHistory(keyword) {
    this.store.saveSearchHistory(keyword)
    this.setData({ history: this.store.searchHistory })
  },

  useKeyword(e) {
    const keyword = e.currentTarget.dataset.keyword
    this.setData({ keyword: keyword })
    this.performSearch(keyword, true)
  },

  clearHistory() {
    const page = this
    ui.confirm({
      title: '清空搜索历史',
      message: '确定清空全部搜索记录吗？'
    }).then(function () {
      page.store.clearSearchHistory()
      page.setData({ history: [] })
      ui.toast('搜索历史已清空')
    }).catch(function () {})
  },

  goShop(e) {
    wx.navigateTo({ url: '/pages/shop/shop?id=' + e.currentTarget.dataset.id })
  },

  quickAdd(e) {
    const shop = e.detail.merchant
    if (!shop || !shop.dishes || !shop.dishes.length) return
    const result = cartUtil.addItem(shop.dishes[0], shop)
    ui.toast(result.cleared ? '已切换店铺并加入' : '已加入购物车')
  },

  addDish(e) {
    const shopId = e.currentTarget.dataset.shopid
    const dishId = e.currentTarget.dataset.dishid
    const shop = this.store.merchants.find(function (item) { return item.id === shopId })
    if (!shop) return
    const dish = shop.dishes.find(function (item) { return item.id === dishId })
    if (!dish) return
    const result = cartUtil.addItem(dish, shop)
    ui.toast(result.cleared ? '已切换店铺并加入' : '已加入购物车')
  },

  surprise() {
    const list = this.store.merchants.length ? this.store.merchants : []
    if (!list.length) {
      ui.toast('暂时没有可推荐的店铺')
      return
    }
    const shop = list[Math.floor(Math.random() * list.length)]
    ui.toast('今天吃 ' + shop.name)
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/shop/shop?id=' + shop.id })
    }, 500)
  }
})
