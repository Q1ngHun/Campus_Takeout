const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')

Page({
  data: {
    statusBarHeight: 20,
    order: null,
    success: false,
    statusTitle: '',
    statusDesc: '',
    progress: [],
    stepActive: 0,
    timelineSteps: [],
    riderVisible: false
  },

  onLoad(options) {
    this.store = useCampusStore()
    this.setData({
      statusBarHeight: getApp().globalData.statusBarHeight,
      success: options.success === '1'
    })
    this.loadOrder(options.id)
  },

  loadOrder(id) {
    const page = this
    this.store.fetchOrder(id).then(function (order) {
      if (!order) {
        ui.toast('订单不存在')
        return
      }
      page.applyOrder(order)
    })
  },

  applyOrder(order) {
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
      stepActive: current,
      timelineSteps: (order.timeline || []).map(function (item) {
        return { text: item.text, desc: item.time || '待更新' }
      }),
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
    ui.alert({
      title: '联系骑手',
      message: rider.name + '  ' + rider.phone + '\n正在为你飞奔，请保持电话畅通。'
    })
  },

  contactShop() {
    ui.alert({
      title: '联系商家',
      message: this.data.order.shopName + '\n校园直送专线：400-0712-326'
    })
  },

  reorder() {
    const order = this.data.order
    const shop = this.store.merchants.find(function (item) { return item.id === order.shopId }) || this.store.merchants[0]
    if (!shop) {
      ui.toast('店铺暂不可用')
      return
    }
    cartUtil.clearCart()
    order.items.forEach(function (item, index) {
      const dish = shop.dishes.find(function (d) { return d.name === item.name }) || shop.dishes[index] || shop.dishes[0]
      cartUtil.addItem(dish, shop, item.qty)
    })
    ui.toast('已加入购物车')
    setTimeout(function () {
      wx.navigateTo({ url: '/pages/cart/cart' })
    }, 450)
  },

  openReview() {
    wx.switchTab({ url: '/pages/orders/orders' })
  },

  copyOrderId() {
    wx.setClipboardData({
      data: this.data.order.id,
      success: function () {
        ui.toast('订单号已复制')
      }
    })
  },

  deleteOrder() {
    const page = this
    ui.confirm({
      title: '删除订单',
      message: '删除后将无法恢复该订单记录。'
    }).then(function () {
      page.store.deleteLocalOrder(page.data.order.id)
      ui.toast('已删除')
      setTimeout(function () {
        wx.switchTab({ url: '/pages/orders/orders' })
      }, 400)
    }).catch(function () {})
  },

  onShareAppMessage() {
    return {
      title: '校园宿达 · 把好吃的送到宿舍楼下',
      path: '/pages/home/home'
    }
  }
})
