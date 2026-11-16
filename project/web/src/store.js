import { computed, reactive } from 'vue'
import rawData from './data.json'

const data = JSON.parse(JSON.stringify(rawData).replaceAll('/assets/images/', '/images/'))

const CART_KEY = 'suda_cart_web_v1'
const FAVORITE_KEY = 'suda_favorites_web_v1'
const ORDER_KEY = 'suda_orders_web_v1'
const ADDRESS_KEY = 'suda_addresses_web_v1'
const SELECTED_ADDRESS_KEY = 'suda_selected_address_web_v1'
const COUPON_KEY = 'suda_selected_coupon_web_v1'
const REVIEW_KEY = 'suda_reviews_web_v1'
const SEARCH_KEY = 'suda_search_web_v1'

function read(key, fallback) {
  try {
    const value = localStorage.getItem(key)
    return value ? JSON.parse(value) : fallback
  } catch (error) {
    return fallback
  }
}

function write(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Local preview continues without persistence.
  }
}

function normalizeMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

export const catalog = data
export const categories = data.categories
export const merchants = data.merchants
export const coupons = data.coupons
export const user = data.user
export const hotSearches = data.hotSearches

export const state = reactive({
  cart: read(CART_KEY, []),
  favorites: read(FAVORITE_KEY, ['m1', 'm3', 'm6']),
  customOrders: read(ORDER_KEY, []),
  addresses: read(ADDRESS_KEY, data.addresses),
  selectedAddress: read(SELECTED_ADDRESS_KEY, null),
  selectedCoupon: read(COUPON_KEY, null),
  reviewed: read(REVIEW_KEY, []),
  searchHistory: read(SEARCH_KEY, data.searchHistory),
  toast: {
    visible: false,
    message: ''
  }
})

let toastTimer = null

export function toast(message) {
  state.toast.message = message
  state.toast.visible = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(function () {
    state.toast.visible = false
  }, 1900)
}

export function getShop(id) {
  return merchants.find(function (shop) { return shop.id === id }) || null
}

export const cartItems = computed(function () {
  return state.cart.map(function (item) {
    const shop = getShop(item.shopId)
    return Object.assign({}, item, { shop })
  })
})

export const cartCount = computed(function () {
  return state.cart.reduce(function (total, item) { return total + item.qty }, 0)
})

export const cartSubtotal = computed(function () {
  return normalizeMoney(state.cart.reduce(function (total, item) { return total + item.price * item.qty }, 0))
})

export const cartShop = computed(function () {
  return state.cart.length ? getShop(state.cart[0].shopId) : null
})

export const cartDelivery = computed(function () {
  return cartShop.value ? cartShop.value.delivery : 0
})

export const activeCoupon = computed(function () {
  if (state.selectedCoupon) {
    return state.selectedCoupon
  }
  return coupons.find(function (item) {
    return item.status === 'available' && item.type === '满减' && cartSubtotal.value >= item.threshold
  }) || null
})

export const cartDiscount = computed(function () {
  return activeCoupon.value ? activeCoupon.value.amount : 0
})

export const cartTotal = computed(function () {
  return normalizeMoney(Math.max(0, cartSubtotal.value + cartDelivery.value - cartDiscount.value))
})

export function addToCart(dish, shop, qty = 1) {
  if (!dish || !shop) return
  if (state.cart.length && state.cart[0].shopId !== shop.id) {
    state.cart = []
    state.selectedCoupon = null
    write(COUPON_KEY, null)
    toast('已切换店铺，购物车已更新')
  }
  const existing = state.cart.find(function (item) { return item.dishId === dish.id })
  if (existing) {
    existing.qty += qty
  } else {
    state.cart.push({
      dishId: dish.id,
      shopId: shop.id,
      shopName: shop.name,
      name: dish.name,
      spec: dish.category + ' · 默认规格',
      price: dish.price,
      image: dish.image,
      qty: qty
    })
  }
  write(CART_KEY, state.cart)
  toast('已加入购物车')
}

export function changeQty(dishId, delta) {
  const index = state.cart.findIndex(function (item) { return item.dishId === dishId })
  if (index === -1) return
  state.cart[index].qty += delta
  if (state.cart[index].qty <= 0) {
    state.cart.splice(index, 1)
  }
  if (!state.cart.length) {
    state.selectedCoupon = null
    write(COUPON_KEY, null)
  }
  write(CART_KEY, state.cart)
}

export function removeItem(dishId) {
  state.cart = state.cart.filter(function (item) { return item.dishId !== dishId })
  write(CART_KEY, state.cart)
}

export function clearCart() {
  state.cart = []
  state.selectedCoupon = null
  write(CART_KEY, state.cart)
  write(COUPON_KEY, null)
}

export function isFavorite(id) {
  return state.favorites.includes(id)
}

export function toggleFavorite(id) {
  if (state.favorites.includes(id)) {
    state.favorites = state.favorites.filter(function (item) { return item !== id })
    toast('已取消收藏')
  } else {
    state.favorites.push(id)
    toast('已收藏这家店')
  }
  write(FAVORITE_KEY, state.favorites)
}

export const favoriteShops = computed(function () {
  return state.favorites.map(getShop).filter(Boolean)
})

export const allOrders = computed(function () {
  const merged = state.customOrders.concat(data.orders)
  return merged.map(function (order) {
    if (state.reviewed.includes(order.id) && order.status === 'done') {
      return Object.assign({}, order, { status: 'rated', statusText: '已完成' })
    }
    return order
  })
})

export function getOrder(id) {
  return allOrders.value.find(function (order) { return order.id === id }) || null
}

export function createOrder(payload) {
  const now = new Date()
  const pad = function (value) { return value < 10 ? '0' + value : '' + value }
  const id = 'SD' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate()) + pad(now.getHours()) + pad(now.getMinutes()) + Math.floor(Math.random() * 90 + 10)
  const order = Object.assign({
    id: id,
    status: 'preparing',
    statusText: '商家制作中',
    createdAt: '刚刚',
    rider: { name: '周师傅', phone: '138****6621', avatar: '周' },
    timeline: [
      { text: '商家已接单', time: '刚刚', done: true },
      { text: '订单已支付', time: '刚刚', done: true }
    ]
  }, payload)
  state.customOrders.unshift(order)
  write(ORDER_KEY, state.customOrders)
  clearCart()
  return order
}

export function markReviewed(id) {
  if (!state.reviewed.includes(id)) {
    state.reviewed.push(id)
    write(REVIEW_KEY, state.reviewed)
  }
}

export function getAddress() {
  return state.selectedAddress || state.addresses.find(function (item) { return item.default }) || state.addresses[0] || null
}

export function selectAddress(address) {
  state.selectedAddress = address
  write(SELECTED_ADDRESS_KEY, address)
  state.addresses = state.addresses.map(function (item) {
    return Object.assign({}, item, { default: item.id === address.id })
  })
  write(ADDRESS_KEY, state.addresses)
}

export function saveAddress(address) {
  if (address.id) {
    state.addresses = state.addresses.map(function (item) {
      return item.id === address.id ? Object.assign({}, item, address) : item
    })
  } else {
    state.addresses.unshift(Object.assign({ id: 'a' + Date.now(), default: state.addresses.length === 0 }, address))
  }
  write(ADDRESS_KEY, state.addresses)
}

export function deleteAddress(id) {
  const target = state.addresses.find(function (item) { return item.id === id })
  state.addresses = state.addresses.filter(function (item) { return item.id !== id })
  if (target && target.default && state.addresses.length) {
    state.addresses[0].default = true
  }
  write(ADDRESS_KEY, state.addresses)
}

export function selectCoupon(coupon) {
  state.selectedCoupon = coupon
  write(COUPON_KEY, coupon)
}

export function saveSearchHistory(keyword) {
  const list = state.searchHistory.filter(function (item) { return item !== keyword })
  list.unshift(keyword)
  state.searchHistory = list.slice(0, 8)
  write(SEARCH_KEY, state.searchHistory)
}

export function clearSearchHistory() {
  state.searchHistory = []
  write(SEARCH_KEY, [])
}

export function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}
