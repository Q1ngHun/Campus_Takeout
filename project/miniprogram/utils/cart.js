/**
 * 购物车工具（兼容旧调用方式）
 * 实际状态由 store/campus.js（Pinia 同构 store）维护，页面无需感知。
 */
const { useCampusStore } = require('../store/campus')

const CART_KEY = 'suda_cart_v1'

function getCart() {
  return useCampusStore().cart
}

function saveCart(cart) {
  return useCampusStore().saveCart(cart)
}

function addItem(dish, shop, qty) {
  return useCampusStore().addToCart(dish, shop, qty)
}

function changeQty(dishId, delta) {
  return useCampusStore().changeQty(dishId, delta)
}

function removeItem(dishId) {
  return useCampusStore().removeItem(dishId)
}

function clearCart() {
  return useCampusStore().clearCart()
}

function summary(cart) {
  return useCampusStore().summary(cart)
}

module.exports = {
  CART_KEY: CART_KEY,
  getCart: getCart,
  saveCart: saveCart,
  addItem: addItem,
  changeQty: changeQty,
  removeItem: removeItem,
  clearCart: clearCart,
  summary: summary
}
