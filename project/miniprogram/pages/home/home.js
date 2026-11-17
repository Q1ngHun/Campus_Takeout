const { useCampusStore } = require('../../store/campus')
const cartUtil = require('../../utils/cart')
const ui = require('../../utils/ui')
const tabbar = require('../../utils/tabbar')

const LOCATIONS = ['北苑 7号', '图书馆 3F', '南门 文创街']

Page({
  data: {
    statusBarHeight: 20,
    categories: [],
    activeCategory: 'all',
    merchants: [],
    visibleMerchants: [],
    hotMerchants: [],
    featureShop: null,
    greeting: '中午好',
    cartCount: 0,
    cartTotal: '0.00',
    cartShopName: '',
    location: LOCATIONS[0],
    locationVisible: false,
    locationActions: LOCATIONS.map(function (name) {
      return { name: name, value: name }
    }),
    noticeText: '',
    dataSource: 'mock',
    apiOnline: false,
    loading: false
  },

  onLoad() {
    this.store = useCampusStore()
    const app = getApp()
    this.setData({
      statusBarHeight: app.globalData.statusBarHeight,
      greeting: this.getGreeting()
    })

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state, store) {
      const merchants = state.merchants || []
      const activeCategory = page.data.activeCategory
      const visibleMerchants = activeCategory === 'all'
        ? merchants
        : merchants.filter(function (shop) {
          return (shop.category || []).indexOf(activeCategory) > -1
        })
      const notice = (state.notifications || [])[0]

      return {
        categories: state.categories || [],
        merchants: merchants,
        visibleMerchants: visibleMerchants,
        hotMerchants: merchants.slice(0, 4),
        featureShop: merchants[0] || null,
        cartCount: store.cartCount,
        cartTotal: store.cartSubtotal.toFixed(2),
        cartShopName: store.cartShop ? store.cartShop.name : '',
        dataSource: state.dataSource,
        apiOnline: state.apiOnline,
        loading: state.apiLoading,
        noticeText: notice ? (notice.title + ' · ' + notice.desc) : ''
      }
    })

    this.store.bootstrap()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  onShow() {
    if (typeof this.getTabBar === 'function' && this.getTabBar()) {
      this.getTabBar().setData({ selected: 0, hidden: false })
    }
    if (this.store) this.refreshCart()
  },

  onPullDownRefresh() {
    const self = this
    this.store.bootstrap({ force: true }).then(function () {
      wx.stopPullDownRefresh()
      ui.toast(self.store.apiOnline ? '已同步最新好味' : '后端未连接，已使用本地数据')
    })
  },

  getGreeting() {
    const hour = new Date().getHours()
    if (hour < 10) return '早上好'
    if (hour < 14) return '中午好'
    if (hour < 18) return '下午好'
    return '晚上好'
  },

  refreshCart() {
    this.setData({
      cartCount: this.store.cartCount,
      cartTotal: this.store.cartSubtotal.toFixed(2),
      cartShopName: this.store.cartShop ? this.store.cartShop.name : ''
    })
  },

  selectCategory(e) {
    const id = e.currentTarget.dataset.id
    const merchants = this.store.merchants
    const list = id === 'all'
      ? merchants
      : merchants.filter(function (shop) { return (shop.category || []).indexOf(id) > -1 })
    this.setData({
      activeCategory: id,
      visibleMerchants: list
    })
    if (id !== 'all' && !list.length) {
      ui.toast('该分类正在上新')
    }
  },

  goSearch() {
    wx.navigateTo({ url: '/pages/search/search' })
  },

  goShop(e) {
    const id = e.currentTarget.dataset.id
    wx.navigateTo({ url: '/pages/shop/shop?id=' + id })
  },

  goCart() {
    wx.navigateTo({ url: '/pages/cart/cart' })
  },

  goCoupons() {
    wx.navigateTo({ url: '/pages/coupons/coupons' })
  },

  goNotifications() {
    const unread = this.store.unreadCount
    const notice = this.store.notifications[0]
    if (!notice) {
      ui.toast('暂无新消息')
      return
    }
    const page = this
    tabbar.hideTabBar(this)
    ui.alert({
      title: unread ? '消息通知 · ' + unread + ' 条未读' : '消息通知',
      message: notice.title + '\n' + notice.desc + '\n' + notice.time
    }).then(function () {
      tabbar.showTabBar(page)
    }).catch(function () {
      tabbar.showTabBar(page)
    })
  },

  goLocation() {
    tabbar.hideTabBar(this)
    this.setData({ locationVisible: true })
  },

  closeLocation() {
    tabbar.showTabBar(this)
    this.setData({ locationVisible: false })
  },

  onSelectLocation(e) {
    const place = (e.detail && (e.detail.value || e.detail.name)) || LOCATIONS[0]
    tabbar.showTabBar(this)
    this.setData({ location: place, locationVisible: false })
    ui.toast('已切换至 ' + place)
  },

  addFromCard(e) {
    const shop = e.detail.merchant
    if (!shop || !shop.dishes || !shop.dishes.length) return
    const result = cartUtil.addItem(shop.dishes[0], shop)
    this.refreshCart()
    ui.toast(result.cleared ? '已切换店铺并加入购物车' : '已加入购物车')
  },

  addFeature() {
    const shop = this.data.featureShop
    if (!shop || !shop.dishes || !shop.dishes.length) {
      ui.toast('今日好味正在准备')
      return
    }
    cartUtil.addItem(shop.dishes[0], shop)
    this.refreshCart()
    ui.toast('已加入购物车')
  },

  onShareAppMessage() {
    return {
      title: '校园宿达 · 把好吃的送到宿舍楼下',
      path: '/pages/home/home'
    }
  }
})
