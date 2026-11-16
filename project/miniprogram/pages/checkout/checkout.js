const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

const ORDER_KEY = 'suda_orders_v1'
const ADDRESS_KEY = 'suda_selected_address_v1'

Page({
  data: {
    statusBarHeight: 20,
    cartItems: [],
    shop: null,
    count: 0,
    subtotal: 0,
    deliveryFee: 0,
    discount: 0,
    total: 0,
    coupon: null,
    address: null,
    deliveryMode: 'now',
    deliveryTime: '预计 12:35 送达',
    remark: '',
    tableware: '1 份餐具',
    payMethod: '微信支付',
    submitting: false
  },

  onLoad() {
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadData()
  },

  onShow() {
    let address = null
    try {
      address = wx.getStorageSync(ADDRESS_KEY) || null
    } catch (e) {}
    if (address) this.setData({ address: address })
  },

  loadData() {
    const cart = cartUtil.getCart()
    const summary = cartUtil.summary(cart)
    const shop = summary.shopId
      ? mock.merchants.find(function (item) { return item.id === summary.shopId }) || null
      : null
    let address = null
    try {
      address = wx.getStorageSync(ADDRESS_KEY) || null
    } catch (e) {}
    if (!address) address = mock.addresses.find(function (item) { return item.default }) || mock.addresses[0]
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
    const deliveryFee = shop ? shop.delivery : 0
    const discount = coupon ? coupon.amount : 0
    const total = Math.max(0, summary.subtotal + deliveryFee - discount)

    this.setData({
      cartItems: cart,
      shop: shop,
      count: summary.count,
      subtotal: summary.subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      total: Math.round(total * 100) / 100,
      coupon: coupon,
      address: address
    })
  },

  goBack() {
    wx.navigateBack()
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  chooseAddress() {
    wx.navigateTo({ url: '/pages/addresses/addresses?select=1' })
  },

  chooseDelivery() {
    const self = this
    wx.showActionSheet({
      itemList: ['立即送出 · 预计 12:35 送达', '12:30 - 12:45', '12:45 - 13:00', '18:00 - 18:15'],
      success: function (res) {
        if (res.tapIndex === 0) {
          self.setData({ deliveryMode: 'now', deliveryTime: '预计 12:35 送达' })
        } else {
          const times = ['12:30 - 12:45', '12:45 - 13:00', '18:00 - 18:15']
          self.setData({ deliveryMode: 'reserve', deliveryTime: '预约 ' + times[res.tapIndex - 1] })
        }
      }
    })
  },

  chooseCoupon() {
    const self = this
    const available = mock.coupons.filter(function (item) { return item.status === 'available' && item.type === '满减' })
    if (!available.length) {
      wx.showToast({ title: '暂无可用优惠券', icon: 'none' })
      return
    }
    const names = available.map(function (item) {
      return (self.data.subtotal >= item.threshold ? '可用 · ' : '未达门槛 · ') + item.title
    })
    wx.showActionSheet({
      itemList: names,
      success: function (res) {
        const coupon = available[res.tapIndex]
        if (self.data.subtotal < coupon.threshold) {
          wx.showToast({ title: '未达到使用门槛', icon: 'none' })
          return
        }
        try { wx.setStorageSync('suda_selected_coupon_v1', coupon) } catch (e) {}
        self.loadData()
      }
    })
  },

  choosePay() {
    const self = this
    wx.showActionSheet({
      itemList: ['微信支付', '宿达余额（¥36.50）'],
      success: function (res) {
        self.setData({ payMethod: res.tapIndex === 0 ? '微信支付' : '宿达余额' })
      }
    })
  },

  chooseTableware() {
    const self = this
    wx.showActionSheet({
      itemList: ['无需餐具', '1 份餐具', '2 份餐具', '3 份餐具'],
      success: function (res) {
        self.setData({ tableware: res.tapIndex === 0 ? '无需餐具' : res.tapIndex + ' 份餐具' })
      }
    })
  },

  onRemarkInput(e) {
    this.setData({ remark: e.detail.value })
  },

  submitOrder() {
    if (this.data.submitting) return
    if (!this.data.count) {
      wx.showToast({ title: '购物车是空的', icon: 'none' })
      return
    }
    if (!this.data.address) {
      wx.showToast({ title: '请选择收货地址', icon: 'none' })
      return
    }

    this.setData({ submitting: true })
    const now = new Date()
    const pad = function (value) { return value < 10 ? '0' + value : '' + value }
    const id = 'SD' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes()) + Math.floor(Math.random() * 90 + 10)
    const order = {
      id: id,
      shopId: this.data.shop.id,
      shopName: this.data.shop.name,
      shopCover: this.data.shop.cover,
      status: 'preparing',
      statusText: '商家制作中',
      statusNote: this.data.deliveryTime + ' · ' + this.data.address.detail,
      total: this.data.total,
      itemCount: this.data.count,
      createdAt: '刚刚',
      address: this.data.address.detail,
      remark: this.data.remark,
      payMethod: this.data.payMethod,
      items: this.data.cartItems.map(function (item) {
        return {
          name: item.name,
          spec: item.spec,
          qty: item.qty,
          price: item.price,
          image: item.image
        }
      }),
      rider: { name: '周师傅', phone: '138****6621', avatar: '周' },
      timeline: [
        { text: '商家已接单', time: '刚刚', done: true },
        { text: '订单已支付', time: '刚刚', done: true }
      ]
    }

    let orders = []
    try {
      orders = wx.getStorageSync(ORDER_KEY) || []
    } catch (e) {}
    orders.unshift(order)
    try {
      wx.setStorageSync(ORDER_KEY, orders)
      cartUtil.clearCart()
      wx.removeStorageSync('suda_selected_coupon_v1')
    } catch (e) {}

    wx.showLoading({ title: '正在下单', mask: true })
    const self = this
    setTimeout(function () {
      wx.hideLoading()
      wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + id + '&success=1' })
    }, 900)
  }
})
