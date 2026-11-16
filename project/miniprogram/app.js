App({
  globalData: {
    statusBarHeight: 20,
    navBarHeight: 44,
    safeBottom: 0,
    brand: '校园宿达',
    apiBase: 'http://localhost:8080/api',
    useRemote: false
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
  }
})
