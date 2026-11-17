const { useCampusStore } = require('../../store/campus')
const ui = require('../../utils/ui')

function computeView(store) {
  const cart = store.cart
  const summary = store.summary(cart)
  const shop = summary.shopId
    ? store.merchants.find(function (item) { return item.id === summary.shopId }) || null
    : null
  const coupon = store.activeCoupon
  const deliveryFee = cart.length ? (shop ? shop.delivery : 1.5) : 0
  const discount = coupon ? coupon.amount : 0
  const total = Math.round(Math.max(0, summary.subtotal + deliveryFee - discount) * 100) / 100

  return {
    cartItems: cart,
    shop: shop,
    count: summary.count,
    subtotal: summary.subtotal,
    deliveryFee: deliveryFee,
    discount: discount,
    total: total,
    totalPrice: Math.round(total * 100),
    coupon: coupon,
    couponCount: store.availableCoupons.length,
    couponUsable: summary.subtotal >= 20,
    dataSource: store.dataSource
  }
}

Page({
  data: {
    statusBarHeight: 20,
    cartItems: [],
    shop: null,
    count: 0,
    subtotal: 0,
    deliveryFee: 1.5,
    discount: 0,
    total: 0,
    totalPrice: 0,
    coupon: null,
    couponCount: 0,
    couponUsable: false,
    couponVisible: false,
    couponActions: [],
    dataSource: 'mock'
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadCart()

    const page = this
    this.unsubscribe = this.store.$bind(this, function () {
      return computeView(page.store)
    })
    this.store.bootstrap()
  },

  onShow() {
    this.loadCart()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadCart() {
    this.setData(computeView(this.store))
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/home/home' })
      }
    })
  },

  goShop() {
    if (!this.data.shop) return
    wx.navigateTo({ url: '/pages/shop/shop?id=' + this.data.shop.id })
  },

  onQtyChange(e) {
    const id = e.currentTarget.dataset.id
    const value = Number(e.detail)
    const item = this.data.cartItems.find(function (cartItem) { return cartItem.dishId === id })
    if (!item) return
    this.store.changeQty(id, value - item.qty)
    this.loadCart()
  },

  remove(e) {
    const id = e.currentTarget.dataset.id
    this.store.removeItem(id)
    this.loadCart()
    ui.toast('已移除')
  },

  chooseCoupon() {
    const subtotal = this.data.subtotal
    const available = this.store.availableCoupons.filter(function (item) {
      return item.type === '满减'
    })
    if (!available.length) {
      ui.toast('暂无可用优惠券')
      return
    }
    this.setData({
      couponVisible: true,
      couponActions: available.map(function (item) {
        const usable = subtotal >= item.threshold
        return {
          name: (usable ? '可用 · ' : '未达门槛 · ') + item.title,
          subname: usable ? '立减 ¥' + item.amount : '还差 ¥' + (item.threshold - subtotal).toFixed(2),
          value: item.id,
          disabled: false
        }
      })
    })
  },

  onSelectCoupon(e) {
    const id = e.detail && e.detail.value
    const coupon = this.store.coupons.find(function (item) { return item.id === id })
    if (!coupon) return
    if (this.data.subtotal < coupon.threshold) {
      ui.toast('还差 ¥' + (coupon.threshold - this.data.subtotal).toFixed(2) + ' 可用')
      return
    }
    this.store.selectCoupon(coupon)
    this.setData({ couponVisible: false })
    this.loadCart()
    ui.toast('已使用 ' + coupon.title)
  },

  closeCoupon() {
    this.setData({ couponVisible: false })
  },

  clearCart() {
    const page = this
    ui.confirm({
      title: '清空购物车',
      message: '确定移除全部已选商品吗？'
    }).then(function () {
      page.store.clearCart()
      page.loadCart()
      ui.toast('购物车已清空')
    }).catch(function () {})
  },

  goCheckout() {
    if (!this.data.count) return
    wx.navigateTo({ url: '/pages/checkout/checkout' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
