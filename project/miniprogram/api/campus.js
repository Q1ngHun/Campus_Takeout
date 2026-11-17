/**
 * Spring Boot 接口封装（全部基于 axios）
 * 后端源码：server/src/main/java/com/suda/campus/controller/CampusApiController.java
 */
const { http, unwrap } = require('./http')

function getHealth() {
  return unwrap(http.get('/health'))
}

function getHome() {
  return unwrap(http.get('/home'))
}

function getMerchants() {
  return unwrap(http.get('/merchants'))
}

function getMerchant(id) {
  return unwrap(http.get('/merchants/' + id))
}

function searchCampus(keyword) {
  return unwrap(http.get('/search', { params: { q: keyword } }))
}

function getOrders() {
  return unwrap(http.get('/orders'))
}

function getOrder(id) {
  return unwrap(http.get('/orders/' + id))
}

function createOrder(payload) {
  return unwrap(http.post('/orders', payload))
}

function getCoupons() {
  return unwrap(http.get('/coupons'))
}

function getAddresses() {
  return unwrap(http.get('/addresses'))
}

function createAddress(payload) {
  return unwrap(http.post('/addresses', payload))
}

function setDefaultAddress(id) {
  return unwrap(http.put('/addresses/' + id + '/default'))
}

function getUser() {
  return unwrap(http.get('/user'))
}

function getNotifications() {
  return unwrap(http.get('/notifications'))
}

function getHotSearches() {
  return unwrap(http.get('/hot-searches'))
}

module.exports = {
  getHealth: getHealth,
  getHome: getHome,
  getMerchants: getMerchants,
  getMerchant: getMerchant,
  searchCampus: searchCampus,
  getOrders: getOrders,
  getOrder: getOrder,
  createOrder: createOrder,
  getCoupons: getCoupons,
  getAddresses: getAddresses,
  createAddress: createAddress,
  setDefaultAddress: setDefaultAddress,
  getUser: getUser,
  getNotifications: getNotifications,
  getHotSearches: getHotSearches
}
