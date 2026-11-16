const mock = require('../../data/mock')
const cartUtil = require('../../utils/cart')

const ORDER_KEY = 'suda_orders_v1'

Page({
  data: {
    statusBarHeight: 20,
    order: null,
    success: false,
    statusTitle: '',
    statusDesc: '',
    progress: [],
    riderVisible: false
  },

  onLoad(options) {
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      success: options.success === '1'
    })
    this.loadOrder(options.id)
  },

  loadOrder(id) {
    let saved = []
    try {
      saved = wx.getStorageSync(ORDER_KEY) || []
    } catch (e) {}
    const order = saved.concat(mock.orders).find(function (item) { return item.id === id }) || saved[0] || mock.orders[0]
    if (!order) return

    let statusTitle = order.statusText
    let statusDesc = order.statusNote
    if (order.status === 'preparing') {
      statusTitle = '商家正在制作'
      statusDesc = '预计 12:20 前送达 · 请耐心等待'
    } else if (order.status === 'delivering') {
      statusTitle = '骑手正在飞奔'
      statusDesc = '预计 12:35 前送达 · 距离你 800m'
    } else if (order.status === 'done') {
      statusTitle = '订单已送达'
      statusDesc = '希望这一餐，刚好合你胃口'
    } else if (order.status === 'rated') {
      statusTitle = '订单已完成'
      statusDesc = '感谢你的认真评价'
    }

    const stepNames = ['已支付', '商家接单', '制作中', '配送中', '已送达']
    const indexMap = { preparing: 2, delivering: 3, done: 4, rated: 4, canceled: 1 }
    const current = indexMap[order.status] !== undefined ? indexMap[order.status] : 2
    const progress = stepNames.map(function (name, index) {
      return {
        name: name,
        done: index <= current,
        current: index === current
      }
    })

    this.setData({
      order: order,
      statusTitle: statusTitle,
      statusDesc: statusDesc,
      progress: progress,
      riderVisible: order.status === 'delivering' || order.status === 'preparing'
    })
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/orders/orders' })
      }
    })
  },

  goHome() {
    wx.switchTab({ url: '/pages/home/home' })
  },

  contactRider() {
    const rider = this.data.order.rider
    if (!rider) return
    wx.showModal({
      title: '联系骑手',
      content: rider.name + '  ' + rider.phone + '\n正在为你飞奔，请保持电话畅通。',
      confirmText: '知道了',
      showCancel: false
    })
  },

  contactShop() {
    wx.showModal({
      title: '联系商家',
      content: this.data.order.shopName + '\n校园直送专线：400-0712-326',
      confirmText: '知道了',
      showCancel: false
    })
  },

  reorder() {
    const order = this.data.order
    const shop = mock.merchants.find(function (item) { return item.id === order.shopId }) || mock.merchants[0]
    cartUtil.clearCart()
    order.items.forEach(function (item, index) {
      const dish = shop.dishes.find(function (d) { return d.name === item.name }) || shop.dishes[index] || shop.dishes[0]
      cartUtil.addItem(dish, shop, item.qty)
    })
    wx.showToast({ title: '已加入购物车', icon: 'none' })
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/cart/cart' })
    }, 450)
  },

  openReview() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  deleteOrder() {
    const self = this
    wx.showModal({
      title: '删除订单',
      content: '删除后将无法恢复该订单记录。',
      confirmColor: '#18211a',
      success: function (res) {
        if (!res.confirm) return
        let saved = []
        try { saved = wx.getStorageSync(ORDER_KEY) || [] } catch (e) {}
        const next = saved.filter(function (item) { return item.id !== self.data.order.id })
        try { wx.setStorageSync(ORDER_KEY, next) } catch (e) {}
        wx.showToast({ title: '已删除', icon: 'none' })
        setTimeout(function () {
          wx.switchTab({ url: '/pages/orders/orders' })
        }, 400)
      }
    })
  },

  onShareAppMessage() {
    return {
      title: '校园宿达 · 把好吃的送到宿舍楼下',
      path: '/pages/home/home'
    }
  }
})
