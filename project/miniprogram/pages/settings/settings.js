const { useCampusStore } = require('../../store/campus')
const config = require('../../config/index')
const ui = require('../../utils/ui')

Page({
  data: {
    statusBarHeight: 20,
    notify: true,
    sound: true,
    location: true,
    personalized: false,
    cacheSize: '12.6 MB',
    apiBase: config.apiBase,
    defaultApiBase: config.defaultApiBase,
    useRemote: true,
    apiOnline: false,
    apiLoading: false,
    apiError: '',
    lastSyncAt: '',
    testing: false,
    apiEditorVisible: false,
    apiDraft: ''
  },

  onLoad() {
    this.store = useCampusStore()
    this.setData({ statusBarHeight: getApp().globalData.statusBarHeight })

    const page = this
    this.unsubscribe = this.store.$bind(this, function (state) {
      return {
        apiBase: state.apiBase,
        useRemote: state.useRemote,
        apiOnline: state.apiOnline,
        apiLoading: state.apiLoading,
        apiError: state.apiError,
        lastSyncAt: state.lastSyncAt
      }
    })

    this.store.bootstrap()
  },

  onUnload() {
    if (this.unsubscribe) this.unsubscribe()
  },

  goBack() {
    wx.navigateBack({
      fail: function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }
    })
  },

  toggle(e) {
    const field = e.currentTarget.dataset.field
    const value = typeof e.detail === 'boolean' ? e.detail : e.detail.value
    const update = {}
    update[field] = value
    this.setData(update)
  },

  toggleRemote(e) {
    const enabled = typeof e.detail === 'boolean' ? e.detail : e.detail.value
    const page = this
    this.store.setUseRemote(enabled).then(function () {
      ui.toast(enabled ? (page.store.apiOnline ? '已连接 Spring Boot API' : '未连接，已回退本地数据') : '已切换为本地示例数据')
    })
  },

  testConnection() {
    const page = this
    this.setData({ testing: true })
    this.store.testConnection().then(function (result) {
      page.setData({ testing: false })
      if (result.ok) {
        ui.toast('连接成功 · ' + result.latency + 'ms · ' + result.service)
      } else {
        ui.alert({
          title: '连接失败',
          message: result.message + '\n请确认后端已启动（start-backend.bat），或在开发者工具中关闭域名校验。'
        })
      }
    })
  },

  editApiBase() {
    this.setData({
      apiEditorVisible: true,
      apiDraft: this.store.apiBase
    })
  },

  reload() {
    const page = this
    ui.loading({ message: '正在同步…' })
    this.store.bootstrap({ force: true }).then(function () {
      ui.hideLoading()
      ui.toast(page.store.apiOnline ? '已同步 ' + page.store.sourceLabel : '后端未连接，已使用本地数据')
    })
  },

  closeApiEditor() {
    this.setData({ apiEditorVisible: false })
  },

  onApiDraftChange(e) {
    this.setData({ apiDraft: e.detail || '' })
  },

  saveApiBase() {
    const url = String(this.data.apiDraft || '').trim()
    if (!/^https?:\/\//.test(url)) {
      ui.toast('请输入 http(s):// 开头的地址')
      return
    }
    const page = this
    this.setData({ apiEditorVisible: false })
    ui.loading({ message: '正在重连…' })
    this.store.setApiBase(url).then(function () {
      ui.hideLoading()
      ui.toast(page.store.apiOnline ? '已切换并连接成功' : '地址已保存，当前未连接')
    })
  },

  resetApiBase() {
    this.setData({ apiDraft: this.data.defaultApiBase })
    this.saveApiBase()
  },

  clearCache() {
    const page = this
    ui.confirm({
      title: '清除缓存',
      message: '将清除搜索记录与临时缓存，不影响订单与地址。'
    }).then(function () {
      try {
        wx.removeStorageSync('suda_search_history_v1')
      } catch (e) {}
      page.store.clearSearchHistory()
      page.setData({ cacheSize: '0.0 MB' })
      ui.toast('缓存已清除')
    }).catch(function () {})
  },

  showAbout() {
    ui.alert({
      title: '关于校园宿达',
      message: '校园宿达 1.0.0\n把好吃的，送到宿舍楼下。\n\n前端：微信小程序 + Vant Weapp + axios + Pinia 同构 store\n后端：Spring Boot 3.5 · REST API'
    })
  },

  showAgreement() {
    ui.alert({
      title: '服务协议与隐私',
      message: '校园宿达为校园场景演示项目。\n本地缓存保存在设备中，订单与地址通过 axios 同步到本地 Spring Boot 服务。'
    })
  },

  contactService() {
    ui.alert({
      title: '联系客服',
      message: '在线时间 08:00 - 24:00\n校园配送专线：400-0712-326'
    })
  },

  logout() {
    const page = this
    ui.confirm({
      title: '退出登录',
      message: '退出后本地购物车和收藏仍会保留。'
    }).then(function () {
      ui.toast('已退出登录')
      setTimeout(function () {
        wx.switchTab({ url: '/pages/profile/profile' })
      }, 600)
    }).catch(function () {})
  }
})
