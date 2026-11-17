import { computed } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { useCampusStore } from './stores/campus'

export const pinia = createPinia()
setActivePinia(pinia)

export const state = useCampusStore()

export const categories = state.categories
export const merchants = state.merchants
export const coupons = state.coupons
export const user = state.user
export const hotSearches = state.hotSearches

export const cartItems = computed(() => state.cartItems)
export const cartCount = computed(() => state.cartCount)
export const cartSubtotal = computed(() => state.cartSubtotal)
export const cartShop = computed(() => state.cartShop)
export const cartDelivery = computed(() => state.cartDelivery)
export const activeCoupon = computed(() => state.activeCoupon)
export const cartDiscount = computed(() => state.cartDiscount)
export const cartTotal = computed(() => state.cartTotal)
export const favoriteShops = computed(() => state.favoriteShops)
export const allOrders = computed(() => state.allOrders)

export function toast(message) {
  return state.showToast(message)
}

export function getShop(id) {
  return state.getShop(id)
}

export function getOrder(id) {
  return state.getOrder(id)
}

export function addToCart(dish, shop, qty = 1) {
  return state.addToCart(dish, shop, qty)
}

export function changeQty(dishId, delta) {
  return state.changeQty(dishId, delta)
}

export function removeItem(dishId) {
  return state.removeItem(dishId)
}

export function clearCart() {
  return state.clearCart()
}

export function isFavorite(id) {
  return state.isFavorite(id)
}

export function toggleFavorite(id) {
  return state.toggleFavorite(id)
}

export function createOrder(payload) {
  return state.createOrder(payload)
}

export function markReviewed(id) {
  return state.markReviewed(id)
}

export function getAddress() {
  return state.getAddress()
}

export function selectAddress(address) {
  return state.selectAddress(address)
}

export function saveAddress(address) {
  return state.saveAddress(address)
}

export function deleteAddress(id) {
  return state.deleteAddress(id)
}

export function selectCoupon(coupon) {
  return state.selectCoupon(coupon)
}

export function saveSearchHistory(keyword) {
  return state.saveSearchHistory(keyword)
}

export function clearSearchHistory() {
  return state.clearSearchHistory()
}

export function formatMoney(value) {
  return Number(value || 0).toFixed(2)
}
