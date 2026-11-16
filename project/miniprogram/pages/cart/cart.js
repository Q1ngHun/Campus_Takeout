const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

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
    coupon: null,
    couponCount: 0,
    couponUsable: false
  },

  onLoad() {
    const app = getApp()
    this.setData({ statusBarHeight: app.globalData.statusBarHeight })
    this.loadCart()
  },

  onShow() {
    this.loadCart()
  },

  loadCart() {
    const cart = cartUtil.getCart()
    const summary = cartUtil.summary(cart)
    const shop = summary.shopId
      ? mock.merchants.find(function (item) { return item.id === summary.shopId }) || null
      : null
    let coupon = null

    try {
      coupon = wx.getStorageSync('suda_selected_coupon_v1') || null
    } catch (e) {}

    if (!coupon) {
      coupon = mock.coupons.find(function (item) {
        return item.status === 'available' && summary.subtotal >= item.threshold && item.type === '满减'
      }) || null
    }
    if (coupon && summary.subtotal < coupon.threshold) coupon = null

    const deliveryFee = cart.length ? (shop ? shop.delivery : 1.5) : 0
    const discount = coupon ? coupon.amount : 0
    const total = Math.max(0, summary.subtotal + deliveryFee - discount)
    const couponCount = mock.coupons.filter(function (item) { return item.status === 'available' }).length

    this.setData({
      cartItems: cart,
      shop: shop,
      count: summary.count,
      subtotal: summary.subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      total: Math.round(total * 100) / 100,
      coupon: coupon,
      couponCount: couponCount,
      couponUsable: summary.subtotal >= 20
    })
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

  plus(e) {
    cartUtil.changeQty(e.currentTarget.dataset.id, 1)
    this.loadCart()
  },

  minus(e) {
    cartUtil.changeQty(e.currentTarget.dataset.id, -1)
    this.loadCart()
  },

  remove(e) {
    const id = e.currentTarget.dataset.id
    cartUtil.removeItem(id)
    this.loadCart()
  },

  chooseCoupon() {
    const self = this
    const subtotal = this.data.subtotal
    const available = mock.coupons.filter(function (item) {
      return item.status === 'available' && item.type === '满减'
    })
    const names = available.map(function (item) {
      const usable = subtotal >= item.threshold
      return (usable ? '可用 · ' : '未达门槛 · ') + item.title
    })

    wx.showActionSheet({
      itemList: names,
      success: function (res) {
        const coupon = available[res.tapIndex]
        if (subtotal < coupon.threshold) {
          wx.showToast({ title: '还差 ¥' + (coupon.threshold - subtotal).toFixed(2) + ' 可用', icon: 'none' })
          return
        }
        try { wx.setStorageSync('suda_selected_coupon_v1', coupon) } catch (e) {}
        self.loadCart()
        wx.showToast({ title: '已使用 ' + coupon.title, icon: 'none' })
      }
    })
  },

  clearCart() {
    const self = this
    wx.showModal({
      title: '清空购物车',
      content: '确定移除全部已选商品吗？',
      success: function (res) {
        if (!res.confirm) return
        cartUtil.clearCart()
        try { wx.removeStorageSync('suda_selected_coupon_v1') } catch (e) {}
        self.loadCart()
      }
    })
  },

  goCheckout() {
    if (!this.data.count) return
    wx.navigateTo({ url: '/pages/checkout/checkout' })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  }
})
