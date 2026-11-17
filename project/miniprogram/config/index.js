/**
 * 全局配置
 * - apiBase: Spring Boot 后端地址（可在「设置 - 后端联调」中修改并持久化）
 * - useRemote: 是否启用远程接口，关闭后完全使用本地示例数据
 */
const STORAGE_KEY = 'suda_api_config_v1'
const DEFAULT_API_BASE = 'http://localhost:8080/api'

function readSavedConfig() {
  try {
    const saved = wx.getStorageSync(STORAGE_KEY)
    if (saved && typeof saved === 'object') return saved
  } catch (e) {}
  return {}
}

function saveApiConfig(patch) {
  const next = Object.assign({}, readSavedConfig(), patch)
  try {
    wx.setStorageSync(STORAGE_KEY, next)
  } catch (e) {}
  return next
}

const saved = readSavedConfig()

module.exports = {
  brand: '校园宿达',
  version: '1.0.0',
  apiBase: saved.apiBase || DEFAULT_API_BASE,
  defaultApiBase: DEFAULT_API_BASE,
  timeout: 8000,
  useRemote: saved.useRemote !== false,
  storageKey: STORAGE_KEY,
  saveApiConfig: saveApiConfig
}
