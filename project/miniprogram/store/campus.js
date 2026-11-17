/**
 * 全局业务 store（Pinia 同构写法）
 *
 * 数据链路：
 *   Page  ->  store action  ->  api/campus.js  ->  axios  ->  wx.request  ->  Spring Boot
 *   失败时自动回退到 data/mock.js，保证离线也能演示完整流程。
 */
const { defineStore } = require('./pinia')
const storage = require('../utils/storage')
const mock = require('../data/mock')
const api = require('../api/campus')
const config = require('../config/index')

const KEYS = {
  cart: 'suda_cart_v1',
  favorites: 'suda_favorites_v1',
  addresses: 'suda_addresses_v1',
  selectedAddress: 'suda_selected_address_v1',
  selectedCoupon: 'suda_selected_coupon_v1',
  orders: 'suda_orders_v1',
  reviews: 'suda_reviews_v1',
  history: 'suda_search_history_v1'
}

function clone(value) {
  if (value === undefined) return value
  return JSON.parse(JSON.stringify(value))
}

function round(value) {
  return Math.round(Number(value || 0) * 100) / 100
}

function settle(promises) {
  return Promise.all(promises.map(function (promise) {
    return promise.then(
      function (value) { return { status: 'fulfilled', value: value } },
      function (reason) { return { status: 'rejected', reason: reason } }
    )
  }))
}

function errorMessage(error) {
  if (!error) return '未知错误'
  return error.friendlyMessage || error.message || '网络请求失败'
}

function defaultTimeline() {
  return [
    { text: '商家已接单', time: '刚刚', done: true },
    { text: '订单已支付', time: '刚刚', done: true }
  ]
}

function decorateOrder(order) {
  if (!order) return order
  const next = clone(order)
  if (!next.rider) {
    next.rider = { name: '周师傅', phone: '138****6621', avatar: '周' }
  }
  if (!next.timeline || !next.timeline.length) next.timeline = defaultTimeline()
  if (!next.statusText) {
    next.statusText = next.status === 'preparing' ? '商家制作中' : '订单进行中'
  }
  return next
}

function localSearch(keyword) {
  const lower = String(keyword || '').toLowerCase()
  const merchants = mock.merchants.filter(function (shop) {
    const text = [shop.name, shop.en, shop.tags.join(' '), shop.hot.join(' '), shop.address]
      .join(' ')
      .toLowerCase()
    return text.indexOf(lower) > -1
  })
  const dishes = []
  mock.merchants.forEach(function (shop) {
    shop.dishes.forEach(function (dish) {
      if ((dish.name + dish.desc).toLowerCase().indexOf(lower) > -1) {
        dishes.push(Object.assign({}, dish, { shopId: shop.id, shopName: shop.name }))
      }
    })
  })
  return { merchants: merchants, dishes: dishes, count: merchants.length + dishes.length }
}

function buildLocalOrder(payload, reason) {
  const now = new Date()
  const pad = function (value) { return value < 10 ? '0' + value : '' + value }
  const id = payload.id || ('SD' + now.getFullYear() + pad(now.getMonth() + 1) + pad(now.getDate())
    + pad(now.getHours()) + pad(now.getMinutes()) + Math.floor(Math.random() * 90 + 10))
  return decorateOrder(Object.assign({
    id: id,
    status: 'preparing',
    statusText: '商家制作中',
    statusNote: '已加入本地下单队列',
    createdAt: '刚刚',
    offline: true,
    offlineReason: reason || ''
  }, payload, { id: id }))
}

const useCampusStore = defineStore('campus', {
  state: function () {
    return {
      categories: clone(mock.categories),
      merchants: clone(mock.merchants),
      coupons: clone(mock.coupons),
      user: clone(mock.user),
      hotSearches: clone(mock.hotSearches),
      notifications: clone(mock.notifications || []),
      remoteOrders: clone(mock.orders || []),
      localOrders: storage.get(KEYS.orders, []),
      cart: storage.get(KEYS.cart, []),
      favorites: storage.get(KEYS.favorites, ['m1', 'm3', 'm6']),
      addresses: storage.get(KEYS.addresses, clone(mock.addresses)),
      selectedAddress: storage.get(KEYS.selectedAddress, null),
      selectedCoupon: storage.get(KEYS.selectedCoupon, null),
      reviewed: storage.get(KEYS.reviews, []),
      searchHistory: storage.get(KEYS.history, clone(mock.searchHistory)),
      apiBase: config.apiBase,
      useRemote: config.useRemote,
      apiOnline: false,
      apiLoading: false,
      apiError: '',
      lastSyncAt: '',
      dataSource: 'mock'
    }
  },

  getters: {
    cartShop: function (state) {
      if (!state.cart.length) return null
      return state.merchants.find(function (shop) { return shop.id === state.cart[0].shopId }) || null
    },
    cartCount: function (state) {
      return state.cart.reduce(function (total, item) { return total + item.qty }, 0)
    },
    cartSubtotal: function (state) {
      return round(state.cart.reduce(function (total, item) { return total + item.price * item.qty }, 0))
    },
    cartDelivery: function () {
      return this.cartShop ? this.cartShop.delivery : 0
    },
    activeCoupon: function (state) {
      if (state.selectedCoupon) return state.selectedCoupon
      return state.coupons.find(function (item) {
        return item.status === 'available' && item.type === '满减' && this.cartSubtotal >= item.threshold
      }, this) || null
    },
    cartDiscount: function () {
      return this.activeCoupon ? this.activeCoupon.amount : 0
    },
    cartTotal: function () {
      return round(Math.max(0, this.cartSubtotal + this.cartDelivery - this.cartDiscount))
    },
    allOrders: function (state) {
      const seen = {}
      const merged = state.localOrders.concat(state.remoteOrders).filter(function (order) {
        if (!order || seen[order.id]) return false
        seen[order.id] = true
        return true
      })
      return merged.map(function (order) {
        if (state.reviewed.indexOf(order.id) > -1 && order.status === 'done') {
          return Object.assign({}, order, { status: 'rated', statusText: '已完成' })
        }
        return order
      })
    },
    activeOrder: function (state) {
      return this.allOrders.find(function (order) {
        return order.status === 'delivering' || order.status === 'preparing'
      }) || null
    },
    favoriteShops: function (state) {
      return state.favorites.map(function (id) {
        return state.merchants.find(function (shop) { return shop.id === id })
      }).filter(Boolean)
    },
    availableCoupons: function (state) {
      return state.coupons.filter(function (item) { return item.status === 'available' })
    },
    unreadCount: function (state) {
      return state.notifications.filter(function (item) { return item.unread }).length
    },
    sourceLabel: function (state) {
      return state.dataSource === 'remote' ? 'Spring Boot API' : '本地示例数据'
    }
  },

  actions: {
    saveCart: function (list) {
      this.cart = Array.isArray(list) ? list : []
      storage.set(KEYS.cart, this.cart)
      return this.cart
    },

    addToCart: function (dish, shop, qty) {
      if (!dish || !shop) return { cart: this.cart, cleared: false }
      const count = qty || 1
      let cart = this.cart.slice()
      let cleared = false

      if (cart.length && cart[0].shopId !== shop.id) {
        cart = []
        cleared = true
        this.selectedCoupon = null
        storage.remove(KEYS.selectedCoupon)
      }

      const index = cart.findIndex(function (item) { return item.dishId === dish.id })
      if (index > -1) {
        cart[index] = Object.assign({}, cart[index], { qty: cart[index].qty + count })
      } else {
        cart.push({
          dishId: dish.id,
          shopId: shop.id,
          shopName: shop.name,
          name: dish.name,
          spec: dish.category + ' · 默认规格',
          price: dish.price,
          image: dish.image,
          qty: count
        })
      }

      this.cart = cart
      storage.set(KEYS.cart, cart)
      return { cart: cart, cleared: cleared }
    },

    changeQty: function (dishId, delta) {
      const cart = this.cart.slice()
      const index = cart.findIndex(function (item) { return item.dishId === dishId })
      if (index === -1) return cart
      const nextQty = cart[index].qty + delta
      if (nextQty <= 0) {
        cart.splice(index, 1)
      } else {
        cart[index] = Object.assign({}, cart[index], { qty: nextQty })
      }
      if (!cart.length) {
        this.selectedCoupon = null
        storage.remove(KEYS.selectedCoupon)
      }
      this.cart = cart
      storage.set(KEYS.cart, cart)
      return cart
    },

    removeItem: function (dishId) {
      const cart = this.cart.filter(function (item) { return item.dishId !== dishId })
      return this.saveCart(cart)
    },

    clearCart: function () {
      this.selectedCoupon = null
      storage.remove(KEYS.selectedCoupon)
      return this.saveCart([])
    },

    summary: function (list) {
      const cart = Array.isArray(list) ? list : this.cart
      const count = cart.reduce(function (total, item) { return total + item.qty }, 0)
      const subtotal = round(cart.reduce(function (total, item) { return total + item.price * item.qty }, 0))
      return {
        count: count,
        subtotal: subtotal,
        shopId: cart.length ? cart[0].shopId : '',
        shopName: cart.length ? cart[0].shopName : '',
        delivery: cart.length ? this.cartDelivery : 0
      }
    },

    selectCoupon: function (coupon) {
      this.selectedCoupon = coupon || null
      if (coupon) storage.set(KEYS.selectedCoupon, coupon)
      else storage.remove(KEYS.selectedCoupon)
    },

    getAddress: function () {
      return this.selectedAddress
        || this.addresses.find(function (item) { return item.default })
        || this.addresses[0]
        || null
    },

    selectAddress: function (address) {
      if (!address) return
      this.selectedAddress = address
      storage.set(KEYS.selectedAddress, address)
      const self = this
      this.addresses = this.addresses.map(function (item) {
        return Object.assign({}, item, { default: item.id === address.id })
      })
      storage.set(KEYS.addresses, this.addresses)
      if (!this.useRemote) return
      api.setDefaultAddress(address.id).then(function () {
        self.apiOnline = true
      }).catch(function (error) {
        self.apiError = errorMessage(error)
      })
    },

    saveAddress: function (payload) {
      const list = this.addresses.slice()
      const existingIndex = payload.id
        ? list.findIndex(function (item) { return item.id === payload.id })
        : -1

      if (existingIndex > -1) {
        list[existingIndex] = Object.assign({}, list[existingIndex], payload)
        this.addresses = list
        storage.set(KEYS.addresses, list)
        return Promise.resolve(list[existingIndex])
      }

      const draft = Object.assign({}, payload, {
        id: payload.id || ('local-' + Date.now()),
        default: list.length === 0
      })
      list.unshift(draft)
      this.addresses = list
      storage.set(KEYS.addresses, list)

      if (!this.useRemote) return Promise.resolve(draft)

      const self = this
      return api.createAddress(draft).then(function (response) {
        const remote = (response && response.address) || draft
        self.addresses = self.addresses.map(function (item) {
          return item.id === draft.id ? Object.assign({}, draft, remote) : item
        })
        storage.set(KEYS.addresses, self.addresses)
        self.apiOnline = true
        return remote
      }).catch(function (error) {
        self.apiError = errorMessage(error)
        return draft
      })
    },

    deleteAddress: function (id) {
      const target = this.addresses.find(function (item) { return item.id === id })
      let list = this.addresses.filter(function (item) { return item.id !== id })
      if (target && target.default && list.length) {
        list = list.map(function (item, index) {
          return index === 0 ? Object.assign({}, item, { default: true }) : item
        })
      }
      this.addresses = list
      storage.set(KEYS.addresses, list)
      if (this.selectedAddress && this.selectedAddress.id === id) {
        this.selectedAddress = null
        storage.remove(KEYS.selectedAddress)
      }
    },

    isFavorite: function (id) {
      return this.favorites.indexOf(id) > -1
    },

    toggleFavorite: function (id) {
      let favorites
      let active
      if (this.favorites.indexOf(id) > -1) {
        favorites = this.favorites.filter(function (item) { return item !== id })
        active = false
      } else {
        favorites = this.favorites.concat([id])
        active = true
      }
      this.favorites = favorites
      storage.set(KEYS.favorites, favorites)
      return active
    },

    saveSearchHistory: function (keyword) {
      if (!keyword) return
      let history = this.searchHistory.filter(function (item) { return item !== keyword })
      history.unshift(keyword)
      history = history.slice(0, 8)
      this.searchHistory = history
      storage.set(KEYS.history, history)
    },

    clearSearchHistory: function () {
      this.searchHistory = []
      storage.set(KEYS.history, [])
    },

    markReviewed: function (id) {
      if (this.reviewed.indexOf(id) === -1) {
        this.reviewed = this.reviewed.concat([id])
        storage.set(KEYS.reviews, this.reviewed)
      }
    },

    hydrate: function () {
      const savedCart = storage.get(KEYS.cart, null)
      if (Array.isArray(savedCart)) this.cart = savedCart
      const savedLocal = storage.get(KEYS.orders, null)
      if (Array.isArray(savedLocal)) this.localOrders = savedLocal
      const savedAddresses = storage.get(KEYS.addresses, null)
      if (Array.isArray(savedAddresses) && savedAddresses.length) this.addresses = savedAddresses
      const savedCoupon = storage.get(KEYS.selectedCoupon, null)
      if (savedCoupon) this.selectedCoupon = savedCoupon
      const savedSelectedAddress = storage.get(KEYS.selectedAddress, null)
      if (savedSelectedAddress) this.selectedAddress = savedSelectedAddress
    },

    applyHome: function (home) {
      if (!home) return
      if (Array.isArray(home.categories)) this.categories = clone(home.categories)
      if (Array.isArray(home.merchants)) this.merchants = clone(home.merchants)
      if (home.user) this.user = Object.assign({}, this.user, home.user)
      if (Array.isArray(home.coupons)) {
        const merged = clone(home.coupons)
        this.coupons.forEach(function (coupon) {
          const exists = merged.find(function (item) { return item.id === coupon.id })
          if (!exists) merged.push(coupon)
        })
        this.coupons = merged
      }
    },

    resetToMock: function () {
      this.categories = clone(mock.categories)
      this.merchants = clone(mock.merchants)
      this.coupons = clone(mock.coupons)
      this.user = clone(mock.user)
      this.hotSearches = clone(mock.hotSearches)
      this.notifications = clone(mock.notifications || [])
      this.remoteOrders = clone(mock.orders || [])
      this.dataSource = 'mock'
      this.apiOnline = false
    },

    bootstrap: async function (options) {
      const force = options && options.force
      if (this.apiLoading) return
      if (!this.useRemote) {
        this.dataSource = 'mock'
        this.apiOnline = false
        this.apiError = '已关闭远程数据（设置 - 后端联调）'
        return
      }
      if (!force && this.dataSource === 'remote') return

      this.apiLoading = true
      this.apiError = ''

      const results = await settle([
        api.getHome(),
        api.getOrders(),
        api.getCoupons(),
        api.getAddresses(),
        api.getUser(),
        api.getNotifications(),
        api.getHotSearches()
      ])

      const home = results[0]
      const orders = results[1]
      const coupons = results[2]
      const addresses = results[3]
      const user = results[4]
      const notifications = results[5]
      const hotSearches = results[6]
      let online = false
      let firstError = ''

      if (home.status === 'fulfilled') {
        this.applyHome(home.value)
        online = true
      } else {
        firstError = errorMessage(home.reason)
      }

      if (orders.status === 'fulfilled' && orders.value) {
        const list = (orders.value.list || []).map(decorateOrder)
        this.remoteOrders = clone(list)
        online = true
      }

      if (coupons.status === 'fulfilled' && coupons.value) {
        this.coupons = clone(coupons.value.list || [])
        online = true
      }

      if (addresses.status === 'fulfilled' && addresses.value) {
        const list = clone(addresses.value.list || [])
        if (list.length) {
          this.addresses = list
          storage.set(KEYS.addresses, list)
        }
        online = true
      }

      if (user.status === 'fulfilled' && user.value) {
        this.user = Object.assign({}, this.user, user.value)
        online = true
      }

      if (notifications.status === 'fulfilled' && Array.isArray(notifications.value)) {
        this.notifications = clone(notifications.value)
        online = true
      }

      if (hotSearches.status === 'fulfilled' && Array.isArray(hotSearches.value)) {
        this.hotSearches = clone(hotSearches.value)
        online = true
      }

      this.apiOnline = online
      this.dataSource = online ? 'remote' : 'mock'
      this.apiError = online ? '' : firstError
      this.lastSyncAt = this.formatTime(new Date())
      this.apiLoading = false
    },

    formatTime: function (date) {
      const pad = function (value) { return value < 10 ? '0' + value : '' + value }
      return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds())
    },

    refreshHome: async function () {
      try {
        const home = await api.getHome()
        this.applyHome(home)
        this.apiOnline = true
        this.dataSource = 'remote'
        this.lastSyncAt = this.formatTime(new Date())
        return true
      } catch (error) {
        this.apiError = errorMessage(error)
        return false
      }
    },

    refreshOrders: async function () {
      try {
        const data = await api.getOrders()
        this.remoteOrders = clone((data.list || []).map(decorateOrder))
        this.apiOnline = true
        this.dataSource = 'remote'
        return true
      } catch (error) {
        this.apiError = errorMessage(error)
        return false
      }
    },

    refreshCoupons: async function () {
      try {
        const data = await api.getCoupons()
        this.coupons = clone(data.list || [])
        this.apiOnline = true
        return true
      } catch (error) {
        this.apiError = errorMessage(error)
        return false
      }
    },

    refreshAddresses: async function () {
      try {
        const data = await api.getAddresses()
        const list = clone(data.list || [])
        if (list.length) {
          this.addresses = list
          storage.set(KEYS.addresses, list)
        }
        this.apiOnline = true
        return true
      } catch (error) {
        this.apiError = errorMessage(error)
        return false
      }
    },

    search: async function (keyword) {
      if (!this.useRemote) return localSearch(keyword)
      try {
        const data = await api.searchCampus(keyword)
        this.apiOnline = true
        this.dataSource = 'remote'
        return {
          merchants: clone(data.merchants || []),
          dishes: clone(data.dishes || []),
          count: data.count || 0,
          source: 'remote'
        }
      } catch (error) {
        this.apiError = errorMessage(error)
        const fallback = localSearch(keyword)
        fallback.source = 'mock'
        return fallback
      }
    },

    fetchMerchant: async function (id) {
      const cached = this.merchants.find(function (shop) { return shop.id === id })
      if (!this.useRemote) return cached || mock.merchants[0]
      try {
        const merchant = await api.getMerchant(id)
        this.apiOnline = true
        return clone(merchant)
      } catch (error) {
        this.apiError = errorMessage(error)
        return cached || mock.merchants[0]
      }
    },

    fetchOrder: async function (id) {
      const cached = this.allOrders.find(function (order) { return order.id === id })
      if (!this.useRemote) return cached || null
      try {
        const order = await api.getOrder(id)
        this.apiOnline = true
        return decorateOrder(order)
      } catch (error) {
        this.apiError = errorMessage(error)
        return cached || null
      }
    },

    createOrder: async function (payload) {
      const requestPayload = Object.assign({}, payload, {
        timeline: payload.timeline || defaultTimeline()
      })

      if (!this.useRemote) {
        const order = buildLocalOrder(requestPayload, '远程数据已关闭')
        this.localOrders = [order].concat(this.localOrders)
        storage.set(KEYS.orders, this.localOrders)
        this.clearCart()
        return order
      }

      try {
        const response = await api.createOrder(requestPayload)
        const order = decorateOrder((response && response.order) || response)
        this.remoteOrders = [order].concat(this.remoteOrders)
        storage.remove(KEYS.selectedCoupon)
        this.selectedCoupon = null
        this.apiOnline = true
        this.dataSource = 'remote'
        this.clearCart()
        return order
      } catch (error) {
        this.apiError = errorMessage(error)
        this.apiOnline = false
        const order = buildLocalOrder(requestPayload, this.apiError)
        this.localOrders = [order].concat(this.localOrders)
        storage.set(KEYS.orders, this.localOrders)
        this.clearCart()
        return order
      }
    },

    deleteLocalOrder: function (id) {
      const list = this.localOrders.filter(function (order) { return order.id !== id })
      this.localOrders = list
      storage.set(KEYS.orders, list)
    },

    testConnection: async function () {
      const startedAt = Date.now()
      try {
        const health = await api.getHealth()
        this.apiOnline = true
        this.lastSyncAt = this.formatTime(new Date())
        this.apiError = ''
        return {
          ok: true,
          latency: Date.now() - startedAt,
          status: (health && health.status) || 'UP',
          service: (health && health.service) || 'campus-suda'
        }
      } catch (error) {
        this.apiOnline = false
        this.apiError = errorMessage(error)
        return { ok: false, message: this.apiError }
      }
    },

    setApiBase: function (url) {
      const value = String(url || '').trim() || config.defaultApiBase
      config.saveApiConfig({ apiBase: value })
      require('../api/http').setBaseURL(value)
      this.apiBase = value
      this.dataSource = 'mock'
      return this.bootstrap({ force: true })
    },

    setUseRemote: function (enabled) {
      config.saveApiConfig({ useRemote: !!enabled })
      this.useRemote = !!enabled
      if (!enabled) {
        this.dataSource = 'mock'
        this.apiOnline = false
        this.apiError = '已切换为本地示例数据'
        return Promise.resolve(false)
      }
      return this.bootstrap({ force: true })
    }
  }
})

module.exports = {
  useCampusStore: useCampusStore
}
