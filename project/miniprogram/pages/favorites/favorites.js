const mock = require('../../data/mock')
const favoriteUtil = require('../../utils/favorite')
const cartUtil = require('../../utils/cart')

Page({
  data: {
    statusBarHeight: 20,
    favorites: [],
    count: 0
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
  },

  onShow() {
    this.loadFavorites()
  },

  loadFavorites() {
    const ids = favoriteUtil.getFavorites()
    const favorites = mock.merchants.filter(function (shop) { return ids.indexOf(shop.id) > -1 })
    this.setData({ favorites: favorites, count: favorites.length })
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
    if (!shop) return
    const result = cartUtil.addItem(shop.dishes[0], shop)
    wx.showToast({ title: result.cleared ? '已切换店铺并加入' : '已加入购物车', icon: 'none' })
  },

  removeFavorite(e) {
    const id = e.currentTarget.dataset.id
    favoriteUtil.toggleFavorite(id)
    this.loadFavorites()
    wx.showToast({ title: '已取消收藏', icon: 'none' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
