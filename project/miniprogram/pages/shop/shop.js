const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')
const favoriteUtil = require('../../utils/favorite')

Page({
  data: {
    statusBarHeight: 20,
    shop: null,
    menuCategories: [],
    activeCategory: '',
    visibleDishes: [],
    cartCount: 0,
    cartTotal: '0.00',
    cartItems: [],
    cartPanelVisible: false,
    favorite: false
  },

  onLoad(options) {
    const id = options.id || 'm1'
    const shop = mock.merchants.find(function (item) { return item.id === id }) || mock.merchants[0]
    const menuCategories = []
    shop.dishes.forEach(function (dish) {
      if (menuCategories.indexOf(dish.category) === -1) menuCategories.push(dish.category)
    })
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      shop: shop,
      menuCategories: menuCategories,
      activeCategory: menuCategories[0],
      favorite: favoriteUtil.isFavorite(shop.id)
    })
    this.refreshCart()
    wx.showShareMenu({ withShareTicket: true })
  },

  refreshCart() {
    const cart = cartUtil.getCart()
    const shopId = this.data.shop.id
    const shopCart = cart.filter(function (item) { return item.shopId === shopId })
    const qtyMap = {}
    shopCart.forEach(function (item) { qtyMap[item.dishId] = item.qty })

    const dishes = this.data.shop.dishes
      .filter(function (dish) { return dish.category === this.data.activeCategory }, this)
      .map(function (dish) {
        return Object.assign({}, dish, { qty: qtyMap[dish.id] || 0 })
      })

    const summary = cartUtil.summary()
    const isCurrent = summary.shopId === shopId

    this.setData({
      visibleDishes: dishes,
      cartItems: shopCart,
      cartCount: isCurrent ? summary.count : 0,
      cartTotal: isCurrent ? summary.subtotal.toFixed(2) : '0.00'
    })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  selectCategory(e) {
    const category = e.currentTarget.dataset.category
    this.setData({ activeCategory: category })
    this.refreshCart()
  },

  addDish(e) {
    const id = e.currentTarget.dataset.id
    const dish = this.data.shop.dishes.find(function (item) { return item.id === id })
    if (!dish) return
    const result = cartUtil.addItem(dish, this.data.shop)
    if (result.cleared) {
      wx.showToast({ title: '已清空上一家店铺', icon: 'none' })
    }
    this.refreshCart()
  },

  minusDish(e) {
    const id = e.currentTarget.dataset.id
    cartUtil.changeQty(id, -1)
    this.refreshCart()
  },

  plusCartItem(e) {
    const id = e.currentTarget.dataset.id
    cartUtil.changeQty(id, 1)
    this.refreshCart()
  },

  minusCartItem(e) {
    const id = e.currentTarget.dataset.id
    cartUtil.changeQty(id, -1)
    this.refreshCart()
  },

  toggleCartPanel() {
    if (!this.data.cartCount) {
      wx.showToast({ title: '还没选餐哦', icon: 'none' })
      return
    }
    this.setData({ cartPanelVisible: !this.data.cartPanelVisible })
  },

  closeCartPanel() {
    this.setData({ cartPanelVisible: false })
  },

  noop() {},

  clearCart() {
    const self = this
    wx.showModal({
      title: '清空已选餐品',
      content: '确定清空购物车吗？',
      success: function (res) {
        if (!res.confirm) return
        cartUtil.clearCart()
        self.refreshCart()
        self.setData({ cartPanelVisible: false })
      }
    })
  },

  goCheckout() {
    if (!this.data.cartCount) return
    this.setData({ cartPanelVisible: false })
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  toggleFavorite() {
    const favorite = favoriteUtil.toggleFavorite(this.data.shop.id)
    this.setData({ favorite: favorite })
    wx.showToast({ title: favorite ? '已收藏这家店' : '已取消收藏', icon: 'none' })
  },

  openCoupon() {
    wx.showModal({
      title: this.data.shop.coupon,
      content: '下单自动抵扣，无需手动领取。\n仅限本店使用，不与其他优惠同享。',
      showCancel: false,
      confirmText: '知道了'
    })
  },

  callShop() {
    wx.showModal({
      title: '联系商家',
      content: this.data.shop.name + '\n校园直送专线：400-0712-326',
      confirmText: '知道了',
      showCancel: false
    })
  },

  onShareAppMessage() {
    return {
      title: this.data.shop.name + ' · 校园宿达',
      path: '/pages/shop/shop?id=' + this.data.shop.id,
      imageUrl: this.data.shop.cover
    }
  }
})
