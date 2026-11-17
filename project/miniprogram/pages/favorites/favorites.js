const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')

Page({
  data: {
    statusBarHeight: 20,
    favorites: [],
    count: 0,
    dataSource: 'mock'
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state, store) {
      return {
        favorites: store.favoriteShops,
        count: store.favoriteShops.length,
        dataSource: state.dataSource
      }
    })
    this.store.bootstrap()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadFavorites() {
    this.setData({
      favorites: this.store.favoriteShops,
      count: this.store.favoriteShops.length
    })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
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

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    this.store.toggleFavorite(id)
    this.loadFavorites()
    ui.toast('已取消收藏')
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
