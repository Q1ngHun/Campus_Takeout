const FAVORITE_KEY = 'suda_favorites_v1'
const SEED = ['m1', 'm3', 'm6']

function getFavorites() {
  try {
    const value = wx.getStorageSync(FAVORITE_KEY)
    if (Array.isArray(value)) return value
  } catch (e) {}
  try {
    wx.setStorageSync(FAVORITE_KEY, SEED)
  } catch (e) {}
  return SEED.slice()
}

function isFavorite(id) {
  return getFavorites().indexOf(id) > -1
}

function toggleFavorite(id) {
  const favorites = getFavorites()
  const index = favorites.indexOf(id)
  if (index > -1) {
    favorites.splice(index, 1)
  } else {
    favorites.push(id)
  }
  try {
    wx.setStorageSync(FAVORITE_KEY, favorites)
  } catch (e) {}
  return favorites.indexOf(id) > -1
}

module.exports = {
  FAVORITE_KEY,
  getFavorites,
  isFavorite,
  toggleFavorite
}
