<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  addToCart,
  cartCount,
  cartShop,
  cartSubtotal,
  changeQty,
  clearCart,
  getShop,
  state,
  toast,
  toggleFavorite
} from '../store'

const route = useRoute()
const router = useRouter()
const shop = getShop(route.params.id) || getShop('m1')
const menuCategories = [...new Set(shop.dishes.map((dish) => dish.category))]
const activeCategory = ref(menuCategories[0])
const cartPanel = ref(false)

const favorite = computed(() => state.favorites.includes(shop.id))
const visibleDishes = computed(() => {
  return shop.dishes
    .filter((dish) => dish.category === activeCategory.value)
    .map((dish) => {
      const item = state.cart.find((cartItem) => cartItem.dishId === dish.id)
      return Object.assign({}, dish, { qty: item ? item.qty : 0 })
    })
})

const shopCart = computed(() => state.cart.filter((item) => item.shopId === shop.id))
const shopCount = computed(() => cartShop.value && cartShop.value.id === shop.id ? cartCount.value : 0)
const shopSubtotal = computed(() => cartShop.value && cartShop.value.id === shop.id ? cartSubtotal.value : 0)

function add(dish) {
  addToCart(dish, shop)
}

function minus(dish) {
  changeQty(dish.id, -1)
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function toggleFav() {
  toggleFavorite(shop.id)
}

function callShop() {
  toast('校园直送专线 400-0712-326')
}

function openCoupon() {
  toast(`${shop.coupon} · 下单自动抵扣`)
}

function clear() {
  clearCart()
  cartPanel.value = false
  toast('购物车已清空')
}

function checkout() {
  cartPanel.value = false
  router.push('/cart')
}

function openCart() {
  if (!shopCount.value) {
    toast('还没选餐哦')
    return
  }
  cartPanel.value = true
}
</script>

<template>
  <main class="shop-page" :style="{ paddingBottom: '86px' }">
    <section class="shop-cover-wrap">
      <img class="shop-cover" :src="shop.cover" :alt="shop.name" />
      <div class="cover-mask"></div>
      <div class="shop-nav">
        <button class="nav-icon" @click="goBack"><img src="/icons/chevron-left.svg" alt="" /></button>
        <div class="nav-right">
          <button class="nav-icon" :class="{ favorited: favorite }" @click="toggleFav">
            <img src="/icons/heart.svg" alt="" />
          </button>
          <button class="nav-icon" @click="toast('分享链接已复制')">
            <img src="/icons/share.svg" alt="" />
          </button>
        </div>
      </div>
      <div class="cover-stamp">
        <span>SUDA SELECTED</span><i></i><span>NO. 0712</span>
      </div>
    </section>

    <section class="shop-info-card">
      <div class="badge-row">
        <span class="badge-pill">{{ shop.badge }}</span>
        <span class="badge-live"><i></i>校园直送</span>
      </div>
      <div class="shop-name-row">
        <h1>{{ shop.name }}</h1>
        <span class="shop-rating">★ {{ shop.rating }}</span>
      </div>
      <span class="shop-en">{{ shop.en }}</span>
      <div class="shop-stats">
        <span><strong>{{ shop.sales }}</strong><small>月售</small></span>
        <i></i>
        <span><strong>{{ shop.time }} min</strong><small>送达</small></span>
        <i></i>
        <span><strong>¥{{ shop.delivery }}</strong><small>配送</small></span>
        <i></i>
        <span><strong>{{ shop.distance }}</strong><small>距离</small></span>
      </div>
      <div class="shop-tags">
        <span v-for="tag in shop.tags" :key="tag">{{ tag }}</span>
      </div>
      <button class="coupon-strip" @click="openCoupon">
        <span class="coupon-left">
          <b>券</b>
          <span><strong>{{ shop.coupon }}</strong><small>下单自动抵扣 · 校园专享</small></span>
        </span>
        <span class="coupon-get">领取</span>
      </button>
      <div class="notice-row">
        <span class="notice-label">店铺公告</span>
        <span class="notice-text">{{ shop.notice }}</span>
        <button @click="callShop"><img src="/icons/phone.svg" alt="" /></button>
      </div>
    </section>

    <div class="section-row menu-head">
      <div>
        <h2>点餐</h2>
        <span class="section-en">CHOOSE YOUR BOWL</span>
      </div>
      <span class="menu-note">现点现做 · 约 {{ shop.time }} 分钟</span>
    </div>

    <div class="menu-layout">
      <aside class="menu-side">
        <button
          v-for="category in menuCategories"
          :key="category"
          :class="{ active: activeCategory === category }"
          @click="activeCategory = category"
        >{{ category }}</button>
      </aside>

      <div class="menu-main">
        <div class="menu-category">
          <strong>{{ activeCategory }}</strong>
          <small>{{ visibleDishes.length }} 道</small>
        </div>
        <article v-for="dish in visibleDishes" :key="dish.id" class="dish-card">
          <img :src="dish.image" :alt="dish.name" />
          <div class="dish-copy">
            <div class="dish-name-row">
              <h3>{{ dish.name }}</h3>
              <span v-if="dish.tag">{{ dish.tag }}</span>
            </div>
            <p>{{ dish.desc }}</p>
            <small>{{ dish.sales || '本月热销' }}</small>
            <div class="dish-bottom">
              <div class="dish-price">
                <span>¥{{ dish.price }}</span>
                <del v-if="dish.originalPrice">¥{{ dish.originalPrice }}</del>
              </div>
              <div v-if="dish.qty" class="stepper">
                <button class="minus" @click="minus(dish)"><img src="/icons/minus.svg" alt="" /></button>
                <span>{{ dish.qty }}</span>
                <button class="plus" @click="add(dish)"><img src="/icons/plus.svg" alt="" /></button>
              </div>
              <button v-else class="add-dish" @click="add(dish)"><img src="/icons/plus.svg" alt="" /></button>
            </div>
          </div>
        </article>
        <div class="menu-footer">
          <img src="/icons/leaf.svg" alt="" />
          食材每日新鲜直采，餐盒使用可降解材质
        </div>
      </div>
    </div>

    <div class="shop-cart">
      <button class="cart-left" @click="openCart">
        <span class="cart-icon" :class="{ filled: shopCount }">
          <img src="/icons/bag.svg" alt="" />
          <b v-if="shopCount">{{ shopCount }}</b>
        </span>
        <span class="cart-copy">
          <strong v-if="shopCount">¥{{ shopSubtotal.toFixed(2) }}</strong>
          <strong v-else>还没有选餐</strong>
          <small>{{ shopCount ? `已选 ${shopCount} 件 · 另需配送费 ¥${shop.delivery}` : '选择喜欢的餐品吧' }}</small>
        </span>
      </button>
      <button class="checkout-btn" :class="{ disabled: !shopCount }" @click="checkout">
        去结算 <img src="/icons/arrow.svg" alt="" />
      </button>
    </div>

    <transition name="fade">
      <div v-if="cartPanel" class="sheet-mask" @click.self="cartPanel = false">
        <div class="sheet cart-sheet">
          <div class="sheet-handle"></div>
          <div class="panel-head">
            <div>
              <strong>已选餐品</strong>
              <small>{{ shopCount }} ITEMS · {{ shop.name }}</small>
            </div>
            <button class="clear" @click="clear"><img src="/icons/trash.svg" alt="" />清空</button>
          </div>
          <div class="cart-scroll">
            <div v-for="item in shopCart" :key="item.dishId" class="cart-row">
              <img :src="item.image" alt="" />
              <div>
                <strong>{{ item.name }}</strong>
                <small>{{ item.spec }}</small>
                <span>¥{{ item.price }}</span>
              </div>
              <div class="stepper">
                <button class="minus" @click="changeQty(item.dishId, -1)"><img src="/icons/minus.svg" alt="" /></button>
                <span>{{ item.qty }}</span>
                <button class="plus" @click="changeQty(item.dishId, 1)"><img src="/icons/plus.svg" alt="" /></button>
              </div>
            </div>
          </div>
          <div class="panel-foot">
            <div>
              <small>小计</small>
              <strong><small>¥</small>{{ shopSubtotal.toFixed(2) }}</strong>
              <span>另需配送费 ¥{{ shop.delivery }}</span>
            </div>
            <button @click="checkout">去结算 <img src="/icons/arrow.svg" alt="" /></button>
          </div>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.shop-page {
  min-height: 100%;
  background: #f4f2ec;
}
.shop-cover-wrap {
  position: relative;
  height: 220px;
  background: #14251b;
  overflow: hidden;
}
.shop-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.cover-mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 16, 12, 0.34), rgba(10, 16, 12, 0.02) 35%, rgba(10, 16, 12, 0.45));
}
.shop-nav {
  position: absolute;
  left: 13px;
  right: 13px;
  top: 12px;
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.nav-icon {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.12);
}
.nav-icon img {
  width: 17px;
  height: 17px;
}
.nav-icon.favorited {
  background: #ff6b4a;
}
.nav-icon.favorited img {
  filter: invert(1);
}
.nav-right {
  display: flex;
  gap: 7px;
}
.cover-stamp {
  position: absolute;
  left: 16px;
  bottom: 22px;
  display: flex;
  align-items: center;
  gap: 5px;
  color: rgba(255, 255, 255, 0.82);
  font-size: 7px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.cover-stamp i {
  width: 18px;
  height: 1px;
  background: rgba(255, 255, 255, 0.4);
}
.shop-info-card {
  position: relative;
  z-index: 5;
  margin: -32px 12px 0;
  padding: 14px;
  border-radius: 19px;
  background: #fff;
  box-shadow: 0 9px 23px rgba(24, 33, 26, 0.09);
}
.badge-row {
  display: flex;
  align-items: center;
  gap: 6px;
}
.badge-pill {
  height: 18px;
  padding: 0 6px;
  border-radius: 4px;
  background: #18211a;
  color: var(--lime);
  font-size: 8px;
  font-weight: 800;
  display: flex;
  align-items: center;
}
.badge-live {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #7f887e;
  font-size: 8.5px;
}
.badge-live i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lime-deep);
}
.shop-name-row {
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 8px;
}
.shop-name-row h1 {
  margin: 0;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.8px;
}
.shop-rating {
  height: 22px;
  padding: 0 6px;
  border-radius: 11px;
  background: #eef7d5;
  color: #4e6810;
  font-size: 9.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
}
.shop-en {
  display: block;
  margin-top: 3px;
  color: #a4aaa1;
  font-size: 7px;
  letter-spacing: 1.5px;
  font-weight: 600;
}
.shop-stats {
  display: flex;
  align-items: center;
  margin-top: 11px;
  padding: 9px 0;
  border-top: 1px solid #f0eee8;
  border-bottom: 1px solid #f0eee8;
}
.shop-stats > span {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.shop-stats strong {
  font-size: 11.5px;
  font-weight: 800;
  color: #263026;
}
.shop-stats small {
  color: #9ba198;
  font-size: 8px;
}
.shop-stats > i {
  width: 1px;
  height: 18px;
  background: #eeece5;
}
.shop-tags {
  display: flex;
  gap: 4px;
  margin-top: 9px;
}
.shop-tags span {
  padding: 2px 5px;
  border-radius: 3px;
  background: #f4f5ef;
  color: #6b746a;
  font-size: 8px;
}
.coupon-strip {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9px;
  padding: 7px 8px;
  border: 0;
  border-radius: 9px;
  background: #fff4ee;
  text-align: left;
}
.coupon-left {
  display: flex;
  align-items: center;
  gap: 6px;
}
.coupon-left > b {
  width: 19px;
  height: 19px;
  border-radius: 5px;
  background: #ff6b4a;
  color: #fff;
  font-size: 10px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coupon-left > span {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.coupon-left strong {
  color: #db5739;
  font-size: 11px;
  font-weight: 800;
}
.coupon-left small {
  color: #c68d7c;
  font-size: 8px;
}
.coupon-get {
  height: 23px;
  padding: 0 9px;
  border-radius: 11px;
  background: #ff6b4a;
  color: #fff;
  font-size: 9px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.notice-row {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 9px;
}
.notice-label {
  flex: 0 0 auto;
  padding: 2px 4px;
  border-radius: 3px;
  background: #f1f2ed;
  color: #889087;
  font-size: 7.5px;
}
.notice-text {
  flex: 1;
  min-width: 0;
  color: #889087;
  font-size: 8.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.notice-row button {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #f4f5ef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.notice-row button img {
  width: 11px;
  height: 11px;
}
.menu-head {
  margin-top: 22px;
}
.menu-note {
  color: #91988f;
  font-size: 8.5px;
  padding-bottom: 2px;
}
.menu-layout {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0 12px;
  margin-top: 10px;
}
.menu-side {
  position: sticky;
  top: 12px;
  width: 79px;
  flex: 0 0 auto;
  padding: 4px;
  border-radius: 12px;
  background: #eae8e1;
}
.menu-side button {
  width: 100%;
  min-height: 41px;
  padding: 6px 5px;
  border: 0;
  border-radius: 9px;
  background: transparent;
  color: #7d857d;
  font-size: 10px;
  line-height: 1.3;
}
.menu-side button.active {
  background: #18211a;
  color: var(--lime);
  font-weight: 800;
}
.menu-main {
  flex: 1;
  min-width: 0;
}
.menu-category {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 2px 2px 8px;
}
.menu-category strong {
  font-size: 13.5px;
  font-weight: 800;
}
.menu-category small {
  color: #a1a79f;
  font-size: 8px;
  letter-spacing: 0.5px;
}
.dish-card {
  display: flex;
  gap: 7px;
  padding: 7px;
  margin-bottom: 8px;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 13px rgba(24, 33, 26, 0.035);
}
.dish-card > img {
  width: 86px;
  height: 100px;
  border-radius: 9px;
  object-fit: cover;
  flex: 0 0 auto;
}
.dish-copy {
  flex: 1;
  min-width: 0;
  padding: 2px 0;
  display: flex;
  flex-direction: column;
}
.dish-name-row {
  display: flex;
  align-items: flex-start;
  gap: 3px;
}
.dish-name-row h3 {
  margin: 0;
  font-size: 12.5px;
  font-weight: 800;
  line-height: 1.35;
  color: #232d23;
}
.dish-name-row span {
  flex: 0 0 auto;
  padding: 1px 3px;
  border-radius: 3px;
  background: #eef7d5;
  color: #587416;
  font-size: 7px;
  font-weight: 700;
}
.dish-copy p {
  margin: 4px 0 0;
  color: #8e968d;
  font-size: 9px;
  line-height: 1.45;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.dish-copy > small {
  margin-top: 3px;
  color: #b0b5ad;
  font-size: 8px;
}
.dish-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 4px;
}
.dish-price {
  display: flex;
  align-items: baseline;
  gap: 4px;
  font-weight: 900;
}
.dish-price span {
  font-size: 15px;
  letter-spacing: -0.5px;
}
.dish-price del {
  color: #b7bbb4;
  font-size: 8px;
}
.stepper button {
  width: 24px;
  height: 24px;
}
.dish-bottom .stepper button img {
  width: 11px;
  height: 11px;
}
.add-dish {
  width: 25px;
  height: 25px;
  border: 0;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 3px 6px rgba(24, 33, 26, 0.18);
}
.add-dish img {
  width: 12px;
  height: 12px;
}
.menu-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 13px 5px 8px;
  color: #a5aba2;
  font-size: 8px;
}
.menu-footer img {
  width: 11px;
  height: 11px;
  opacity: 0.6;
}
.shop-cart {
  position: fixed;
  z-index: 89;
  left: 12px;
  right: 12px;
  bottom: 16px;
  height: 54px;
  padding: 0 7px 0 9px;
  border-radius: 27px;
  background: #18211a;
  box-shadow: 0 12px 28px rgba(24, 33, 26, 0.24);
  display: flex;
  align-items: center;
  gap: 7px;
}
.cart-left {
  flex: 1;
  min-width: 0;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
}
.cart-icon {
  position: relative;
  width: 35px;
  height: 35px;
  border-radius: 50%;
  background: #303c31;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.cart-icon.filled {
  background: var(--lime);
}
.cart-icon img {
  width: 17px;
  height: 17px;
}
.cart-icon b {
  position: absolute;
  right: -2px;
  top: -3px;
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border: 1px solid #18211a;
  border-radius: 7px;
  background: #ff6b4a;
  color: #fff;
  font-size: 7.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.cart-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cart-copy strong {
  color: #fff;
  font-size: 16px;
  font-weight: 900;
  line-height: 1.1;
}
.cart-copy small {
  color: #7e8b7b;
  font-size: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.checkout-btn {
  flex: 0 0 auto;
  height: 39px;
  padding: 0 9px 0 13px;
  border: 0;
  border-radius: 20px;
  background: var(--lime);
  color: #18211a;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
  font-weight: 900;
}
.checkout-btn img {
  width: 14px;
  height: 14px;
}
.checkout-btn.disabled {
  background: #3b463b;
  color: #8e988a;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.cart-sheet {
  color: #18211a;
}
.panel-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.panel-head > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.panel-head strong {
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.panel-head small {
  color: #a0a69d;
  font-size: 7.5px;
  letter-spacing: 1px;
}
.clear {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8d958b;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
}
.clear img {
  width: 12px;
  height: 12px;
}
.cart-scroll {
  max-height: 240px;
  overflow-y: auto;
  margin-top: 10px;
}
.cart-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 0;
  border-bottom: 1px solid #eeece5;
}
.cart-row > img {
  width: 45px;
  height: 45px;
  border-radius: 9px;
  object-fit: cover;
}
.cart-row > div:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.cart-row > div:nth-child(2) strong {
  font-size: 11.5px;
  font-weight: 700;
}
.cart-row > div:nth-child(2) small {
  color: #a1a79f;
  font-size: 8px;
}
.cart-row > div:nth-child(2) span {
  color: #18211a;
  font-size: 11px;
  font-weight: 800;
}
.panel-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
  padding-top: 10px;
  border-top: 1px solid #e7e4dc;
}
.panel-foot > div {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.panel-foot small {
  color: #9ba198;
  font-size: 8px;
}
.panel-foot strong {
  font-size: 23px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.panel-foot strong small {
  color: #18211a;
  font-size: 10px;
}
.panel-foot > div > span {
  color: #a4aaa1;
  font-size: 8px;
}
.panel-foot > button {
  height: 44px;
  padding: 0 10px 0 16px;
  border: 0;
  border-radius: 22px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12.5px;
  font-weight: 800;
}
.panel-foot > button img {
  width: 14px;
  height: 14px;
}
</style>
