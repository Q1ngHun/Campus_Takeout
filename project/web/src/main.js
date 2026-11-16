import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './styles.css'

import HomeView from './views/HomeView.vue'
import OrdersView from './views/OrdersView.vue'
import ProfileView from './views/ProfileView.vue'
import ShopView from './views/ShopView.vue'
import SearchView from './views/SearchView.vue'
import CartView from './views/CartView.vue'
import CheckoutView from './views/CheckoutView.vue'
import OrderDetailView from './views/OrderDetailView.vue'
import AddressesView from './views/AddressesView.vue'
import CouponsView from './views/CouponsView.vue'
import FavoritesView from './views/FavoritesView.vue'
import SettingsView from './views/SettingsView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView, meta: { tab: 'home' } },
  { path: '/orders', name: 'orders', component: OrdersView, meta: { tab: 'orders' } },
  { path: '/profile', name: 'profile', component: ProfileView, meta: { tab: 'profile' } },
  { path: '/shop/:id', name: 'shop', component: ShopView },
  { path: '/search', name: 'search', component: SearchView },
  { path: '/cart', name: 'cart', component: CartView },
  { path: '/checkout', name: 'checkout', component: CheckoutView },
  { path: '/order/:id', name: 'order-detail', component: OrderDetailView },
  { path: '/addresses', name: 'addresses', component: AddressesView },
  { path: '/coupons', name: 'coupons', component: CouponsView },
  { path: '/favorites', name: 'favorites', component: FavoritesView },
  { path: '/settings', name: 'settings', component: SettingsView }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})

createApp(App).use(router).mount('#app')
