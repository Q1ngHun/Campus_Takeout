import { defineStore } from 'pinia'
import rawData from '../data.json'
import {
  createAddress,
  createCampusOrder,
  getAddresses,
  getCoupons,
  getHome,
  getOrders,
  searchCampus,
  setDefaultAddress
} from '../api/campus'

const CART_KEY = 'suda_cart_web_v1'
const FAVORITE_KEY = 'suda_favorites_web_v1'
const ORDER_KEY = 'suda_orders_web_v1'
const ADDRESS_KEY = 'suda_addresses_web_v1'
const SELECTED_ADDRESS_KEY = 'suda_selected_address_web_v1'
const COUPON_KEY = 'suda_selected_coupon_web_v1'
const REVIEW_KEY = 'suda_reviews_web_v1'
const SEARCH_KEY = 'suda_search_web_v1'

const LOCAL_DATA = JSON.parse(JSON.stringify(rawData).replaceAll('/assets/images/', '/images/'))

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

function normalizeMedia(value) {
  if (value == null) return value
  return JSON.parse(JSON.stringify(value).replaceAll('/assets/images/', '/images/'))
}

function replaceArray(target, source) {
  const next = Array.isArray(source) ? source.map(normalizeMedia) : []
  target.splice(0, target.length, ...next)
}

function normalizeMoney(value) {
  return Math.round(Number(value) * 100) / 100
}

function defaultTimeline() {
  return [
    { text: '商家已接单', time: '刚刚', done: true },
    { text: '订单已支付', time: '刚刚', done: true }
  ]
}

function decorateOrder(order) {
  const normalized = normalizeMedia(order)
  if (!normalized) return normalized
  if (!normalized.rider) {
    normalized.rider = { name: '周师傅', phone: '138****6621', avatar: '周' }
  }
  if (!normalized.timeline || !normalized.timeline.length) {
    normalized.timeline = defaultTimeline()
  }
  if (!normalized.statusText) {
    normalized.statusText = normalized.status === 'preparing' ? '商家制作中' : '订单进行中'
  }
  return normalized
}

let toastTimer = null
let bootstrapped = false

export const useCampusStore = defineStore('campus', {
  state: () => ({
    categories: normalizeMedia(LOCAL_DATA.categories),
    merchants: normalizeMedia(LOCAL_DATA.merchants),
    coupons: normalizeMedia(LOCAL_DATA.coupons),
    user: normalizeMedia(LOCAL_DATA.user),
    hotSearches: normalizeMedia(LOCAL_DATA.hotSearches),
    orders: (LOCAL_DATA.orders || []).map(decorateOrder),
    customOrders: read(ORDER_KEY, []).map(decorateOrder),
    cart: read(CART_KEY, []),
    favorites: read(FAVORITE_KEY, ['m1', 'm3', 'm6']),
    addresses: read(ADDRESS_KEY, normalizeMedia(LOCAL_DATA.addresses)),
    selectedAddress: read(SELECTED_ADDRESS_KEY, null),
    selectedCoupon: read(COUPON_KEY, null),
    reviewed: read(REVIEW_KEY, []),
    searchHistory: read(SEARCH_KEY, LOCAL_DATA.searchHistory),
    toast: {
      visible: false,
      message: ''
    },
    apiOnline: false,
    apiLoading: false,
    apiError: '',
    lastSyncAt: ''
  }),

  getters: {
    cartItems(state) {
      return state.cart.map((item) => {
        const shop = state.merchants.find((entry) => entry.id === item.shopId)
        return { ...item, shop }
      })
    },
    cartCount(state) {
      return state.cart.reduce((total, item) => total + item.qty, 0)
    },
    cartSubtotal(state) {
      return normalizeMoney(state.cart.reduce((total, item) => total + item.price * item.qty, 0))
    },
    cartShop(state) {
      if (!state.cart.length) return null
      return state.merchants.find((shop) => shop.id === state.cart[0].shopId) || null
    },
    cartDelivery() {
      return this.cartShop ? this.cartShop.delivery : 0
    },
    activeCoupon(state) {
      if (state.selectedCoupon) return state.selectedCoupon
      return state.coupons.find((item) => {
        return item.status === 'available' && item.type === '满减' && this.cartSubtotal >= item.threshold
      }) || null
    },
    cartDiscount() {
      return this.activeCoupon ? this.activeCoupon.amount : 0
    },
    cartTotal() {
      return normalizeMoney(Math.max(0, this.cartSubtotal + this.cartDelivery - this.cartDiscount))
    },
    favoriteShops(state) {
      return state.favorites
        .map((id) => state.merchants.find((shop) => shop.id === id))
        .filter(Boolean)
    },
    allOrders(state) {
      const seen = new Set()
      const merged = [...state.customOrders, ...state.orders].filter((order) => {
        if (!order || seen.has(order.id)) return false
        seen.add(order.id)
        return true
      })
      return merged.map((order) => {
        if (state.reviewed.includes(order.id) && order.status === 'done') {
          return { ...order, status: 'rated', statusText: '已完成' }
        }
        return order
      })
    }
  },

  actions: {
    showToast(message) {
      this.toast.message = message
      this.toast.visible = true
      clearTimeout(toastTimer)
      toastTimer = setTimeout(() => {
        this.toast.visible = false
      }, 1900)
    },

    getShop(id) {
      return this.merchants.find((shop) => shop.id === id) || null
    },

    getOrder(id) {
      return this.allOrders.find((order) => order.id === id) || null
    },

    applyHome(home) {
      if (!home) return
      const payload = normalizeMedia(home)
      if (Array.isArray(payload.categories)) replaceArray(this.categories, payload.categories)
      if (Array.isArray(payload.merchants)) replaceArray(this.merchants, payload.merchants)
      if (payload.user) Object.assign(this.user, payload.user)
    },

    async bootstrap() {
      if (bootstrapped || this.apiLoading) return
      this.apiLoading = true
      this.apiError = ''
      const results = await Promise.allSettled([
        getHome(),
        getOrders(),
        getCoupons(),
        getAddresses()
      ])
      const [homeResult, ordersResult, couponsResult, addressesResult] = results
      let online = false

      if (homeResult.status === 'fulfilled') {
        this.applyHome(homeResult.value)
        online = true
      } else {
        this.apiError = homeResult.reason?.friendlyMessage || '无法连接 Spring Boot API'
      }

      if (ordersResult.status === 'fulfilled') {
        replaceArray(this.orders, (ordersResult.value.list || []).map(decorateOrder))
        online = true
      }

      if (couponsResult.status === 'fulfilled') {
        replaceArray(this.coupons, couponsResult.value.list || [])
        online = true
      }

      if (addressesResult.status === 'fulfilled') {
        this.addresses = (addressesResult.value.list || []).map(normalizeMedia)
        write(ADDRESS_KEY, this.addresses)
        online = true
      }

      this.apiOnline = online
      this.apiLoading = false
      this.lastSyncAt = new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
      bootstrapped = true

      if (!online) {
        this.showToast('后端未连接，已切换本地数据')
      }
    },

    async refreshOrders() {
      try {
        const data = await getOrders()
        replaceArray(this.orders, (data.list || []).map(decorateOrder))
        this.apiOnline = true
      } catch (error) {
        this.apiError = error.friendlyMessage || error.message
      }
    },

    async searchRemote(keyword) {
      const data = await searchCampus(keyword)
      return {
        merchants: normalizeMedia(data.merchants || []),
        dishes: normalizeMedia(data.dishes || []),
        count: data.count || 0
      }
    },

    addToCart(dish, shop, qty = 1) {
      if (!dish || !shop) return
      if (this.cart.length && this.cart[0].shopId !== shop.id) {
        this.cart = []
        this.selectedCoupon = null
        write(COUPON_KEY, null)
        this.showToast('已切换店铺，购物车已更新')
      }
      const existing = this.cart.find((item) => item.dishId === dish.id)
      if (existing) {
        existing.qty += qty
      } else {
        this.cart.push({
          dishId: dish.id,
          shopId: shop.id,
          shopName: shop.name,
          name: dish.name,
          spec: dish.category + ' · 默认规格',
          price: dish.price,
          image: dish.image,
          qty
        })
      }
      write(CART_KEY, this.cart)
      this.showToast('已加入购物车')
    },

    changeQty(dishId, delta) {
      const index = this.cart.findIndex((item) => item.dishId === dishId)
      if (index === -1) return
      this.cart[index].qty += delta
      if (this.cart[index].qty <= 0) this.cart.splice(index, 1)
      if (!this.cart.length) {
        this.selectedCoupon = null
        write(COUPON_KEY, null)
      }
      write(CART_KEY, this.cart)
    },

    removeItem(dishId) {
      this.cart = this.cart.filter((item) => item.dishId !== dishId)
      write(CART_KEY, this.cart)
    },

    clearCart() {
      this.cart = []
      this.selectedCoupon = null
      write(CART_KEY, this.cart)
      write(COUPON_KEY, null)
    },

    isFavorite(id) {
      return this.favorites.includes(id)
    },

    toggleFavorite(id) {
      if (this.favorites.includes(id)) {
        this.favorites = this.favorites.filter((item) => item !== id)
        this.showToast('已取消收藏')
      } else {
        this.favorites.push(id)
        this.showToast('已收藏这家店')
      }
      write(FAVORITE_KEY, this.favorites)
    },

    async createOrder(payload) {
      const requestPayload = {
        ...payload,
        timeline: payload.timeline || defaultTimeline()
      }
      try {
        const response = await createCampusOrder(requestPayload)
        const remoteOrder = decorateOrder(response.order || response)
        this.orders.unshift(remoteOrder)
        this.apiOnline = true
        this.apiError = ''
        this.clearCart()
        return remoteOrder
      } catch (error) {
        this.apiError = error.friendlyMessage || error.message
        this.apiOnline = false
        const now = new Date()
        const pad = (value) => (value < 10 ? `0${value}` : `${value}`)
        const fallback = decorateOrder({
          ...requestPayload,
          id: `SD${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}${pad(now.getHours())}${pad(now.getMinutes())}${Math.floor(Math.random() * 90 + 10)}`,
          status: 'preparing',
          statusText: '商家制作中',
          createdAt: '刚刚',
          rider: { name: '周师傅', phone: '138****6621', avatar: '周' }
        })
        this.customOrders.unshift(fallback)
        write(ORDER_KEY, this.customOrders)
        this.clearCart()
        this.showToast('后端未连接，已生成本地订单')
        return fallback
      }
    },

    markReviewed(id) {
      if (!this.reviewed.includes(id)) {
        this.reviewed.push(id)
        write(REVIEW_KEY, this.reviewed)
      }
    },

    getAddress() {
      return this.selectedAddress
        || this.addresses.find((item) => item.default)
        || this.addresses[0]
        || null
    },

    selectAddress(address) {
      if (!address) return
      this.selectedAddress = address
      write(SELECTED_ADDRESS_KEY, address)
      this.addresses = this.addresses.map((item) => ({
        ...item,
        default: item.id === address.id
      }))
      write(ADDRESS_KEY, this.addresses)
      setDefaultAddress(address.id)
        .then(() => { this.apiOnline = true })
        .catch(() => {})
    },

    async saveAddress(address) {
      if (address.id) {
        this.addresses = this.addresses.map((item) => {
          return item.id === address.id ? { ...item, ...address } : item
        })
        write(ADDRESS_KEY, this.addresses)
        return address
      }

      const local = {
        ...address,
        id: `local-${Date.now()}`,
        default: this.addresses.length === 0
      }
      this.addresses.unshift(local)
      write(ADDRESS_KEY, this.addresses)

      try {
        const response = await createAddress(local)
        const remote = normalizeMedia(response.address || local)
        const index = this.addresses.findIndex((item) => item.id === local.id)
        if (index > -1) this.addresses.splice(index, 1, remote)
        this.apiOnline = true
        return remote
      } catch (error) {
        this.apiError = error.friendlyMessage || error.message
        return local
      }
    },

    deleteAddress(id) {
      const target = this.addresses.find((item) => item.id === id)
      this.addresses = this.addresses.filter((item) => item.id !== id)
      if (target?.default && this.addresses.length) {
        this.addresses[0].default = true
      }
      write(ADDRESS_KEY, this.addresses)
    },

    selectCoupon(coupon) {
      this.selectedCoupon = coupon
      write(COUPON_KEY, coupon)
    },

    saveSearchHistory(keyword) {
      const list = this.searchHistory.filter((item) => item !== keyword)
      list.unshift(keyword)
      this.searchHistory = list.slice(0, 8)
      write(SEARCH_KEY, this.searchHistory)
    },

    clearSearchHistory() {
      this.searchHistory = []
      write(SEARCH_KEY, [])
    }
  }
})
