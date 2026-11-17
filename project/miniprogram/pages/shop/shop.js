const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')

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
    this.store = useCampusStore()
    const id = options.id || 'm1'
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadShop(id)

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state, store) {
      if (!page.data.shop) return null
      const shopId = page.data.shop.id
      const cart = state.cart.filter(function (item) { return item.shopId === shopId })
      const summary = store.summary(state.cart)
      const isCurrent = summary.shopId === shopId
      return {
        cartItems: cart,
        cartCount: isCurrent ? summary.count : 0,
        cartTotal: isCurrent ? summary.subtotal.toFixed(2) : '0.00'
      }
    })

    this.store.bootstrap()
    wx.showShareMenu({ withShareTicket: true })
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadShop(id) {
    const page = this
    this.store.fetchMerchant(id).then(function (shop) {
      if (!shop) {
        ui.toast('店铺不存在')
        return
      }
      const menuCategories = []
      ;(shop.dishes || []).forEach(function (dish) {
        if (menuCategories.indexOf(dish.category) === -1) menuCategories.push(dish.category)
      })
      page.setData({
        shop: shop,
        menuCategories: menuCategories,
        activeCategory: menuCategories[0] || '',
        favorite: page.store.isFavorite(shop.id)
      })
      page.refreshCart()
    })
  },

  refreshCart() {
    if (!this.data.shop) return
    const shopId = this.data.shop.id
    const cart = this.store.cart
    const shopCart = cart.filter(function (item) { return item.shopId === shopId })
    const qtyMap = {}
    shopCart.forEach(function (item) { qtyMap[item.dishId] = item.qty })

    const activeCategory = this.data.activeCategory
    const dishes = (this.data.shop.dishes || [])
      .filter(function (dish) { return dish.category === activeCategory })
      .map(function (dish) {
        return Object.assign({}, dish, { qty: qtyMap[dish.id] || 0 })
      })

    const summary = this.store.summary(cart)
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
    if (result.cleared) ui.toast('已清空上一家店铺')
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
      ui.toast('还没选餐哦')
      return
    }
    this.setData({ cartPanelVisible: !this.data.cartPanelVisible })
  },

  onCartStepperChange(e) {
    const id = e.currentTarget.dataset.id
    const value = Number(e.detail)
    const item = this.data.cartItems.find(function (cartItem) { return cartItem.dishId === id })
    if (!item) return
    cartUtil.changeQty(id, value - item.qty)
    this.refreshCart()
  },

  closeCartPanel() {
    this.setData({ cartPanelVisible: false })
  },

  noop() {},

  clearCart() {
    const page = this
    ui.confirm({
      title: '清空已选餐品',
      message: '确定清空购物车吗？'
    }).then(function () {
      cartUtil.clearCart()
      page.refreshCart()
      page.setData({ cartPanelVisible: false })
      ui.toast('购物车已清空')
    }).catch(function () {})
  },

  goCheckout() {
    if (!this.data.cartCount) return
    this.setData({ cartPanelVisible: false })
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  toggleFavorite() {
    const favorite = this.store.toggleFavorite(this.data.shop.id)
    this.setData({ favorite: favorite })
    ui.toast(favorite ? '已收藏这家店' : '已取消收藏')
  },

  openCoupon() {
    ui.alert({
      title: this.data.shop.coupon,
      message: '下单自动抵扣，无需手动领取。\n仅限本店使用，不与其他优惠同享。'
    })
  },

  callShop() {
    ui.alert({
      title: '联系商家',
      message: this.data.shop.name + '\n校园直送专线：400-0712-326'
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
