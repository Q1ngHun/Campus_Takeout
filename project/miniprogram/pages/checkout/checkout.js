const { useCampusStore } = require('../../store/campus')
const ui = require('../../utils/ui')

const DELIVERY_OPTIONS = ['立即送出 · 预计 12:35 送达', '12:30 - 12:45', '12:45 - 13:00', '18:00 - 18:15']
const PAY_OPTIONS = ['微信支付', '宿达余额（¥36.50）']
const TABLEWARE_OPTIONS = ['无需餐具', '1 份餐具', '2 份餐具', '3 份餐具']

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
    totalPrice: 0,
    coupon: null,
    address: null,
    deliveryMode: 'now',
    deliveryTime: '预计 12:35 送达',
    remark: '',
    tableware: '1 份餐具',
    payMethod: '微信支付',
    submitting: false,
    loading: false,
    sheetVisible: false,
    sheetTitle: '',
    sheetType: '',
    sheetActions: [],
    sheetCancelText: '取消'
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })
    this.loadData()

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state) {
      if (!page.data.shop) return null
      return { loading: state.apiLoading, dataSource: state.dataSource }
    })
    this.store.bootstrap()
  },

  onShow() {
    this.loadData()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  loadData() {
    const store = this.store
    const cart = store.cart
    const summary = store.summary(cart)
    const shop = summary.shopId
      ? store.merchants.find(function (item) { return item.id === summary.shopId }) || null
      : null
    const coupon = store.activeCoupon
    const deliveryFee = shop ? shop.delivery : 0
    const discount = coupon ? coupon.amount : 0
    const total = Math.round(Math.max(0, summary.subtotal + deliveryFee - discount) * 100) / 100
    const address = store.getAddress()

    this.setData({
      cartItems: cart,
      shop: shop,
      count: summary.count,
      subtotal: summary.subtotal,
      deliveryFee: deliveryFee,
      discount: discount,
      total: total,
      totalPrice: Math.round(total * 100),
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

  openSheet(type, title, actions, cancelText) {
    this.setData({
      sheetVisible: true,
      sheetType: type,
      sheetTitle: title,
      sheetActions: actions,
      sheetCancelText: cancelText || '取消'
    })
  },

  closeSheet() {
    this.setData({ sheetVisible: false })
  },

  chooseDelivery() {
    this.openSheet('delivery', '选择送达时间', DELIVERY_OPTIONS.map(function (name, index) {
      return { name: name, value: index }
    }))
  },

  choosePay() {
    this.openSheet('pay', '选择支付方式', PAY_OPTIONS.map(function (name, index) {
      return { name: name, value: index }
    }))
  },

  chooseTableware() {
    this.openSheet('tableware', '选择餐具份数', TABLEWARE_OPTIONS.map(function (name, index) {
      return { name: name, value: index }
    }))
  },

  chooseCoupon() {
    const subtotal = this.data.subtotal
    const available = this.store.availableCoupons.filter(function (item) { return item.type === '满减' })
    if (!available.length) {
      ui.toast('暂无可用优惠券')
      return
    }
    this.openSheet('coupon', '选择优惠券', available.map(function (item) {
      const usable = subtotal >= item.threshold
      return {
        name: (usable ? '可用 · ' : '未达门槛 · ') + item.title,
        subname: usable ? '立减 ¥' + item.amount : '还差 ¥' + (item.threshold - subtotal).toFixed(2),
        value: item.id
      }
    }), '不使用优惠券')
  },

  onSheetSelect(e) {
    const detail = e.detail || {}
    const type = this.data.sheetType
    this.setData({ sheetVisible: false })

    if (type === 'delivery') {
      const index = Number(detail.value)
      if (index === 0) {
        this.setData({ deliveryMode: 'now', deliveryTime: '预计 12:35 送达' })
      } else {
        const times = ['12:30 - 12:45', '12:45 - 13:00', '18:00 - 18:15']
        this.setData({ deliveryMode: 'reserve', deliveryTime: '预约 ' + times[index - 1] })
      }
      return
    }

    if (type === 'pay') {
      this.setData({ payMethod: Number(detail.value) === 0 ? '微信支付' : '宿达余额' })
      return
    }

    if (type === 'tableware') {
      const index = Number(detail.value)
      this.setData({ tableware: index === 0 ? '无需餐具' : index + ' 份餐具' })
      return
    }

    if (type === 'coupon') {
      if (!detail.value) return
      const coupon = this.store.coupons.find(function (item) { return item.id === detail.value })
      if (!coupon) return
      if (this.data.subtotal < coupon.threshold) {
        ui.toast('未达到使用门槛')
        return
      }
      this.store.selectCoupon(coupon)
      this.loadData()
      ui.toast('已使用 ' + coupon.title)
    }
  },

  onRemarkChange(e) {
    this.setData({ remark: e.detail || '' })
  },

  clearCoupon() {
    this.store.selectCoupon(null)
    this.loadData()
  },

  submitOrder() {
    if (this.data.submitting) return
    if (!this.data.count) {
      ui.toast('购物车是空的')
      return
    }
    if (!this.data.address) {
      ui.toast('请选择收货地址')
      return
    }

    const page = this
    const data = this.data
    const order = {
      shopId: data.shop.id,
      shopName: data.shop.name,
      shopCover: data.shop.cover,
      status: 'preparing',
      statusText: '商家制作中',
      statusNote: data.deliveryTime + ' · ' + data.address.detail,
      total: data.total,
      itemCount: data.count,
      createdAt: '刚刚',
      address: data.address.detail,
      remark: data.remark,
      payMethod: data.payMethod,
      tableware: data.tableware,
      items: data.cartItems.map(function (item) {
        return {
          name: item.name,
          spec: item.spec,
          qty: item.qty,
          price: item.price,
          image: item.image
        }
      })
    }

    this.setData({ submitting: true })
    ui.loading({ message: '正在提交订单…' })

    this.store.createOrder(order).then(function (result) {
      ui.hideLoading()
      page.setData({ submitting: false })
      if (result && result.offline) {
        ui.toast('后端未连接，已生成本地订单')
      } else {
        ui.toast('下单成功')
      }
      setTimeout(function () {
        wx.redirectTo({ url: '/pages/order-detail/order-detail?id=' + result.id + '&success=1' })
      }, 450)
    }).catch(function (error) {
      ui.hideLoading()
      page.setData({ submitting: false })
      ui.alert({ title: '下单失败', message: (error && error.friendlyMessage) || '请稍后再试' })
    })
  }
})
