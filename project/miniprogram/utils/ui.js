/**
 * 统一交互层：用 Vant Weapp 的 Toast / Dialog 替代原生 wx.showToast / wx.showModal。
 * 页面里需要放置 <van-toast id="van-toast" /> 与 <van-dialog id="van-dialog" />。
 */
const Toast = require('@vant/weapp/toast/toast').default
const Dialog = require('@vant/weapp/dialog/dialog').default

function toast(message, options) {
  Toast(Object.assign({
    message: message,
    duration: 1800,
    position: 'middle'
  }, options || {}))
}

function loading(options) {
  Toast.loading(Object.assign({
    message: '加载中…',
    forbidClick: true,
    loadingType: 'spinner',
    duration: 0
  }, options || {}))
}

function hideLoading() {
  Toast.clear()
}

function alert(options) {
  return Dialog.alert(Object.assign({
    confirmButtonText: '知道了',
    confirmButtonColor: '#18211a',
    confirmButtonOpenType: undefined
  }, options || {}))
}

function confirm(options) {
  return Dialog.confirm(Object.assign({
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    confirmButtonColor: '#18211a',
    cancelButtonColor: '#8a9189'
  }, options || {}))
}

module.exports = {
  Toast: Toast,
  Dialog: Dialog,
  toast: toast,
  loading: loading,
  hideLoading: hideLoading,
  alert: alert,
  confirm: confirm
}
