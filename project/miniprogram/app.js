const config = require('./config/index')
const { useCampusStore } = require('./store/campus')

App({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    safeBottom: 0,
    brand: config.brand,
    apiBase: config.apiBase,
    useRemote: config.useRemote,
    store: null
  },

  onLaunch() {
    let info = {}
    try {
      info = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    } catch (e) {
      info = {}
    }
    let menu = null
    try {
      menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    } catch (e) {
      menu = null
    }

    const statusBarHeight = info.statusBarHeight || 20
    this.globalData.statusBarHeight = statusBarHeight
    this.globalData.safeBottom = info.safeArea
      ? Math.max(0, info.screenHeight - info.safeArea.bottom)
      : 0
    this.globalData.navBarHeight = menu && menu.top
      ? (menu.top - statusBarHeight) * 2 + menu.height
      : 44

    const store = useCampusStore()
    this.globalData.store = store
    // 启动即通过 axios 拉取 Spring Boot 数据；失败自动回退本地示例数据
    store.bootstrap()
  }
})
