function get(key, fallback) {
  try {
    const value = wx.getStorageSync(key)
    if (value === '' || value === null || value === undefined) return fallback
    return value
  } catch (e) {
    return fallback
  }
}

function set(key, value) {
  try {
    wx.setStorageSync(key, value)
    return true
  } catch (e) {
    return false
  }
}

function remove(key) {
  try {
    wx.removeStorageSync(key)
    return true
  } catch (e) {
    return false
  }
}

module.exports = {
  get: get,
  set: set,
  remove: remove
}
