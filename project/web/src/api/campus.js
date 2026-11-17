import http from './http'

export async function getHealth() {
  return (await http.get('/health')).data
}

export async function getHome() {
  return (await http.get('/home')).data
}

export async function getMerchants() {
  return (await http.get('/merchants')).data
}

export async function getMerchant(id) {
  return (await http.get(`/merchants/${id}`)).data
}

export async function searchCampus(keyword) {
  return (await http.get('/search', { params: { q: keyword } })).data
}

export async function getOrders() {
  return (await http.get('/orders')).data
}

export async function getOrder(id) {
  return (await http.get(`/orders/${id}`)).data
}

export async function createCampusOrder(payload) {
  return (await http.post('/orders', payload)).data
}

export async function getCoupons() {
  return (await http.get('/coupons')).data
}

export async function getAddresses() {
  return (await http.get('/addresses')).data
}

export async function createAddress(payload) {
  return (await http.post('/addresses', payload)).data
}

export async function setDefaultAddress(id) {
  return (await http.put(`/addresses/${id}/default`)).data
}
