/**
 * axios 实例（小程序适配版）
 *
 * 微信小程序没有 XMLHttpRequest，axios 默认的 xhr adapter 不可用，
 * 这里通过 axios-miniprogram-adapter 把 axios 的请求转交给 wx.request，
 * 从而在小程序里继续使用 axios 的拦截器、超时、并发与 Promise 能力。
 *
 * 说明：axios 的 npm 入口是 Node 版本（依赖 http/util 等内置模块），
 * 无法直接在小程序编译；因此这里引入 axios 官方 dist/axios.min.js（浏览器
 * UMD 构建），再由 adapter 接管请求发送。可用 `npm run sync:axios` 更新。
 */
const axios = require('../vendor/axios.min')
const mpAdapterModule = require('axios-miniprogram-adapter')
const config = require('../config/index')

const mpAdapter = typeof mpAdapterModule === 'function'
  ? mpAdapterModule
  : mpAdapterModule.default

const http = axios.create({
  baseURL: config.apiBase,
  timeout: config.timeout,
  adapter: mpAdapter,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
})

http.interceptors.request.use(
  function (requestConfig) {
    requestConfig.headers = requestConfig.headers || {}
    requestConfig.headers['X-Client'] = 'weapp'
    requestConfig.headers['X-App'] = 'campus-suda'
    requestConfig.meta = Object.assign({ startedAt: Date.now() }, requestConfig.meta)
    return requestConfig
  },
  function (error) {
    return Promise.reject(error)
  }
)

http.interceptors.response.use(
  function (response) {
    const startedAt = response.config && response.config.meta && response.config.meta.startedAt
    response.latency = startedAt ? Date.now() - startedAt : 0
    return response
  },
  function (error) {
    const response = error.response
    const data = response && response.data
    const message = (data && (data.message || data.error || data.msg))
      || (error.errMsg && error.errMsg.indexOf('url not in domain list') > -1 ? '请在开发者工具中勾选「不校验合法域名」' : '')
      || error.errMsg
      || error.message
      || '网络请求失败'
    error.friendlyMessage = message
    error.isNetworkError = !response
    error.isTimeout = error.code === 'ECONNABORTED'
    return Promise.reject(error)
  }
)

function setBaseURL(url) {
  http.defaults.baseURL = url
}

function unwrap(request) {
  return request.then(function (response) {
    return response.data
  })
}

module.exports = {
  http: http,
  setBaseURL: setBaseURL,
  unwrap: unwrap
}
