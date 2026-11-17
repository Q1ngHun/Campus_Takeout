/**
 * 收藏工具（兼容旧调用方式）
 * 实际状态由 store/campus.js（Pinia 同构 store）维护。
 */
const { useCampusStore } = require('../store/campus')

const FAVORITE_KEY = 'suda_favorites_v1'

function getFavorites() {
  return useCampusStore().favorites
}

function isFavorite(id) {
  return useCampusStore().isFavorite(id)
}

function toggleFavorite(id) {
  return useCampusStore().toggleFavorite(id)
}

module.exports = {
  FAVORITE_KEY: FAVORITE_KEY,
  getFavorites: getFavorites,
  isFavorite: isFavorite,
  toggleFavorite: toggleFavorite
}
