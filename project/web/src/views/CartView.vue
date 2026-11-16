<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import EmptyState from '../components/EmptyState.vue'
import {
  activeCoupon,
  cartDelivery,
  cartDiscount,
  cartItems,
  cartShop,
  cartSubtotal,
  cartTotal,
  changeQty,
  clearCart,
  coupons,
  removeItem,
  selectCoupon,
  state,
  toast
} from '../store'

const router = useRouter()
const couponSheet = ref(false)

const couponCount = computed(() => coupons.filter((item) => item.status === 'available').length)
const usableCoupons = computed(() => coupons.filter((item) => item.status === 'available' && item.type === '满减'))

const currentCoupon = computed(() => state.selectedCoupon || activeCoupon.value)

function choose(coupon) {
  if (cartSubtotal.value < coupon.threshold) {
    toast(`还差 ¥${(coupon.threshold - cartSubtotal.value).toFixed(2)} 可用`)
    return
  }
  selectCoupon(coupon)
  couponSheet.value = false
  toast(`已使用 ${coupon.title}`)
}

function clearAll() {
  clearCart()
  toast('购物车已清空')
}

function checkout() {
  router.push('/checkout')
}
</script>

<template>
  <main class="sub-page cart-page">
    <SubNav title="购物车">
      <template #action>
        <button v-if="cartItems.length" class="clear-top" @click="clearAll">
          <img src="/icons/trash.svg" alt="" />
        </button>
      </template>
    </SubNav>

    <section class="cart-head">
      <span class="eyebrow">YOUR CART</span>
      <h1 class="page-display">已选好味<span class="dot">.</span></h1>
      <p>{{ cartItems.length ? `${cartItems.length} 件餐品 · ${cartShop?.name}` : '购物车还空着，去挑点好吃的' }}</p>
    </section>

    <template v-if="cartItems.length">
      <button class="shop-strip" @click="router.push(`/shop/${cartShop.id}`)">
        <img :src="cartShop.cover" alt="" />
        <span>
          <strong>{{ cartShop.name }}</strong>
          <small>校园直送 · 约 {{ cartShop.time }} 分钟送达</small>
        </span>
        <b>继续加购 <img src="/icons/plus.svg" alt="" /></b>
      </button>

      <section class="items-card">
        <div class="card-title"><strong>餐品清单</strong><small>{{ cartItems.length }} ITEMS</small></div>
        <div v-for="item in cartItems" :key="item.dishId" class="cart-row">
          <img :src="item.image" alt="" />
          <div class="row-copy">
            <strong>{{ item.name }}</strong>
            <small>{{ item.spec }}</small>
            <div>
              <span>¥{{ item.price }}</span>
              <button class="remove" @click="removeItem(item.dishId)"><img src="/icons/trash.svg" alt="" /></button>
            </div>
          </div>
          <div class="stepper">
            <button class="minus" @click="changeQty(item.dishId, -1)"><img src="/icons/minus.svg" alt="" /></button>
            <span>{{ item.qty }}</span>
            <button class="plus" @click="changeQty(item.dishId, 1)"><img src="/icons/plus.svg" alt="" /></button>
          </div>
        </div>
      </section>

      <section class="service-card">
        <button class="service-row" @click="couponSheet = true">
          <span class="service-icon coupon-bg"><img src="/icons/coupon.svg" alt="" /></span>
          <span class="service-copy">
            <strong>优惠券</strong>
            <small>{{ currentCoupon ? `${currentCoupon.title} · 已抵扣 ¥${cartDiscount}` : couponCount + ' 张可用' }}</small>
          </span>
          <b :class="{ active: currentCoupon }">{{ currentCoupon ? `-¥${cartDiscount}` : '去选择' }}</b>
          <img class="row-arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
        <div class="row-line"></div>
        <div class="service-row">
          <span class="service-icon delivery-bg"><img src="/icons/scooter.svg" alt="" /></span>
          <span class="service-copy">
            <strong>配送方式</strong>
            <small>校园直送 · 预计 12:35 送达</small>
          </span>
          <b>立即送出</b>
        </div>
      </section>

      <section class="bill-card">
        <div class="card-title"><strong>费用明细</strong><small>DETAILS</small></div>
        <div class="bill-row"><span>商品小计</span><span>¥{{ cartSubtotal.toFixed(2) }}</span></div>
        <div class="bill-row"><span>配送费</span><span>¥{{ cartDelivery.toFixed(2) }}</span></div>
        <div v-if="cartDiscount" class="bill-row discount"><span>优惠券</span><span>-¥{{ cartDiscount }}</span></div>
        <div class="bill-total"><span>合计</span><strong><small>¥</small>{{ cartTotal.toFixed(2) }}</strong></div>
        <div class="bill-note"><img src="/icons/shield.svg" alt="" />校园安心送 · 超时赔付 · 餐损必赔</div>
      </section>

      <div class="checkout-bar">
        <div>
          <span>合计</span>
          <strong><small>¥</small>{{ cartTotal.toFixed(2) }}</strong>
          <small>{{ cartDiscount ? `已优惠 ¥${cartDiscount}` : '已含配送费' }}</small>
        </div>
        <button @click="checkout">提交订单 <img src="/icons/arrow.svg" alt="" /></button>
      </div>
    </template>

    <EmptyState
      v-else
      icon="bag"
      title="购物车还空着"
      desc="去首页逛逛，发现宿舍楼下的好味道"
      action="去逛逛"
      @action="router.push('/')"
    />

    <transition name="fade">
      <div v-if="couponSheet" class="sheet-mask" @click.self="couponSheet = false">
        <div class="sheet">
          <div class="sheet-handle"></div>
          <div class="coupon-head">
            <div><small>COUPON</small><strong>选择优惠券</strong></div>
            <button @click="couponSheet = false"><img src="/icons/close.svg" alt="" /></button>
          </div>
          <button
            v-for="coupon in usableCoupons"
            :key="coupon.id"
            class="coupon-option"
            :class="{ disabled: cartSubtotal < coupon.threshold }"
            @click="choose(coupon)"
          >
            <span class="coupon-value">¥<b>{{ coupon.amount }}</b></span>
            <span class="coupon-copy"><strong>{{ coupon.title }}</strong><small>{{ coupon.scope }}</small></span>
            <span class="coupon-threshold">{{ coupon.threshold ? `满 ${coupon.threshold} 可用` : '无门槛' }}</span>
          </button>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.cart-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.18), transparent 30%),
    #f4f2ec;
  padding-bottom: 94px;
}
.clear-top {
  width: 34px;
  height: 34px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.clear-top img {
  width: 15px;
  height: 15px;
  opacity: 0.55;
}
.cart-head {
  padding: 10px 17px 0;
}
.cart-head p {
  margin: 7px 0 0;
  color: #8b9289;
  font-size: 10.5px;
}
.shop-strip {
  width: calc(100% - 32px);
  margin: 14px 16px 0;
  padding: 8px;
  border: 0;
  border-radius: 13px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  box-shadow: 0 5px 13px rgba(24, 33, 26, 0.04);
}
.shop-strip > img {
  width: 38px;
  height: 38px;
  border-radius: 9px;
}
.shop-strip > span {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.shop-strip strong {
  font-size: 12.5px;
  font-weight: 800;
}
.shop-strip small {
  color: #9ba198;
  font-size: 8.5px;
}
.shop-strip b {
  height: 27px;
  padding: 0 7px 0 9px;
  border-radius: 14px;
  background: #f2f4ee;
  color: #55604f;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 600;
}
.shop-strip b img {
  width: 11px;
  height: 11px;
}
.items-card,
.service-card,
.bill-card {
  margin: 10px 16px 0;
  padding: 12px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(24, 33, 26, 0.04);
}
.card-title {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding-bottom: 5px;
}
.card-title strong {
  font-size: 13.5px;
  font-weight: 800;
}
.card-title small {
  color: #a9afa6;
  font-size: 7.5px;
  letter-spacing: 1px;
  font-weight: 700;
}
.cart-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 0;
  border-bottom: 1px solid #f0eee8;
}
.cart-row:last-child {
  border-bottom: 0;
  padding-bottom: 3px;
}
.cart-row > img {
  width: 64px;
  height: 64px;
  border-radius: 11px;
  object-fit: cover;
}
.row-copy {
  flex: 1;
  min-width: 0;
  align-self: stretch;
  display: flex;
  flex-direction: column;
  padding: 2px 0;
}
.row-copy > strong {
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-copy > small {
  margin-top: 3px;
  color: #a0a69d;
  font-size: 8.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.row-copy > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
}
.row-copy > div > span {
  font-size: 13px;
  font-weight: 900;
}
.remove {
  width: 21px;
  height: 21px;
  border: 0;
  border-radius: 50%;
  background: #f5f4ef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.remove img {
  width: 10px;
  height: 10px;
  opacity: 0.5;
}
.service-card {
  padding: 0 12px;
}
.service-row {
  min-height: 54px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
}
.service-icon {
  width: 30px;
  height: 30px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.service-icon img {
  width: 15px;
  height: 15px;
}
.coupon-bg { background: #fff0eb; }
.delivery-bg { background: #eaf3da; }
.service-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.service-copy strong {
  font-size: 11.5px;
  font-weight: 700;
}
.service-copy small {
  color: #9da39a;
  font-size: 8.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.service-row > b {
  flex: 0 0 auto;
  color: #8d958b;
  font-size: 10px;
  font-weight: 400;
}
.service-row > b.active {
  color: #f05a3b;
  font-weight: 800;
}
.row-arrow {
  width: 11px;
  height: 11px;
  opacity: 0.35;
}
.row-line {
  height: 1px;
  background: #f0eee8;
  margin-left: 37px;
}
.bill-row {
  display: flex;
  justify-content: space-between;
  height: 29px;
  align-items: center;
  color: #707970;
  font-size: 10.5px;
}
.bill-row.discount {
  color: #f05a3b;
}
.bill-total {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  padding-top: 8px;
  border-top: 1px solid #eeece5;
  font-size: 12.5px;
  font-weight: 700;
}
.bill-total strong {
  font-family: "Arial Black", sans-serif;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.bill-total strong small {
  font-size: 9px;
}
.bill-note {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-top: 7px;
  padding: 6px 7px;
  border-radius: 6px;
  background: #f7f7f2;
  color: #929a90;
  font-size: 8px;
}
.bill-note img {
  width: 10px;
  height: 10px;
}
.checkout-bar {
  position: fixed;
  z-index: 80;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 8px 7px 8px 14px;
  border-radius: 27px;
  background: #18211a;
  box-shadow: 0 10px 22px rgba(24, 33, 26, 0.2);
}
.checkout-bar > div {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.checkout-bar > div > span {
  color: #939e90;
  font-size: 9px;
}
.checkout-bar > div > strong {
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.checkout-bar > div > strong small {
  font-size: 10px;
}
.checkout-bar > div > small {
  color: #8ba077;
  font-size: 8px;
}
.checkout-bar > button {
  height: 42px;
  padding: 0 10px 0 16px;
  border: 0;
  border-radius: 21px;
  background: var(--lime);
  color: #18211a;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  font-weight: 900;
}
.checkout-bar > button img {
  width: 14px;
  height: 14px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.coupon-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 10px;
}
.coupon-head > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.coupon-head small {
  color: #9ba198;
  font-size: 7px;
  letter-spacing: 2px;
}
.coupon-head strong {
  font-size: 19px;
  font-weight: 900;
}
.coupon-head button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #eceae3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coupon-head button img {
  width: 14px;
  height: 14px;
}
.coupon-option {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 9px;
  margin-top: 7px;
  padding: 9px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  text-align: left;
}
.coupon-option.disabled {
  opacity: 0.45;
}
.coupon-value {
  width: 48px;
  height: 42px;
  border-radius: 9px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: baseline;
  justify-content: center;
  font-size: 9px;
  font-weight: 800;
}
.coupon-value b {
  font-size: 20px;
}
.coupon-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.coupon-copy strong {
  font-size: 11.5px;
  font-weight: 700;
}
.coupon-copy small {
  color: #9ba198;
  font-size: 8px;
}
.coupon-threshold {
  color: #9ba198;
  font-size: 8.5px;
}
</style>
