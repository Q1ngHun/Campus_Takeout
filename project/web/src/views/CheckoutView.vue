<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import {
  activeCoupon,
  cartDelivery,
  cartDiscount,
  cartItems,
  cartShop,
  cartSubtotal,
  cartTotal,
  coupons,
  createOrder,
  getAddress,
  selectCoupon,
  state,
  toast
} from '../store'

const router = useRouter()
const address = computed(() => getAddress())
const deliveryMode = ref('now')
const deliveryTime = ref('预计 12:35 送达')
const payMethod = ref('微信支付')
const tableware = ref('1 份餐具')
const remark = ref('')
const extraSheet = ref('')
const submitting = ref(false)
const couponSheet = ref(false)

const currentCoupon = computed(() => state.selectedCoupon || activeCoupon.value)

function chooseDelivery() {
  extraSheet.value = 'delivery'
}

function choosePay() {
  extraSheet.value = 'pay'
}

function chooseTableware() {
  extraSheet.value = 'tableware'
}

function applyDelivery(value) {
  if (value === 'now') {
    deliveryMode.value = 'now'
    deliveryTime.value = '预计 12:35 送达'
  } else {
    deliveryMode.value = 'reserve'
    deliveryTime.value = `预约 ${value}`
  }
  extraSheet.value = ''
}

function chooseCoupon(coupon) {
  if (cartSubtotal.value < coupon.threshold) {
    toast('未达到使用门槛')
    return
  }
  selectCoupon(coupon)
  couponSheet.value = false
}

async function submit() {
  if (submitting.value) return
  if (!cartItems.value.length) {
    toast('购物车是空的')
    return
  }
  if (!address.value) {
    toast('请选择收货地址')
    return
  }
  submitting.value = true
  try {
    const order = await createOrder({
      shopId: cartShop.value.id,
      shopName: cartShop.value.name,
      shopCover: cartShop.value.cover,
      statusNote: `${deliveryTime.value} · ${address.value.detail}`,
      total: cartTotal.value,
      itemCount: cartItems.value.reduce((sum, item) => sum + item.qty, 0),
      address: address.value.detail,
      remark: remark.value,
      payMethod: payMethod.value,
      items: cartItems.value.map((item) => ({
        name: item.name,
        spec: item.spec,
        qty: item.qty,
        price: item.price,
        image: item.image
      }))
    })
    toast('下单成功，商家正在准备')
    router.replace(`/order/${order.id}?success=1`)
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <main class="sub-page checkout-page">
    <SubNav title="确认订单" />

    <section class="checkout-head">
      <span class="eyebrow">CHECKOUT</span>
      <h1 class="page-display">最后一步<span class="dot">.</span></h1>
      <p>确认信息，好味马上出发</p>
    </section>

    <template v-if="cartItems.length">
      <button class="address-card" @click="router.push('/addresses?select=1')">
        <span class="address-pin"><img src="/icons/pin.svg" alt="" /></span>
        <span class="address-copy">
          <span class="address-person">
            <strong>{{ address.name }}</strong>
            <span>{{ address.phone }}</span>
            <b>{{ address.label }}</b>
          </span>
          <span class="address-detail">{{ address.detail }}</span>
          <small>{{ address.note || '请送至宿舍楼下，到楼电话联系' }}</small>
        </span>
        <img class="address-arrow" src="/icons/chevron-right.svg" alt="" />
        <span class="address-foot">
          <span><i></i>校园直送 · 骑手可送达宿舍门口</span>
          <b>修改</b>
        </span>
      </button>

      <button class="delivery-card" @click="chooseDelivery">
        <span class="delivery-icon"><img src="/icons/clock.svg" alt="" /></span>
        <span class="delivery-copy">
          <strong>{{ deliveryMode === 'now' ? '立即送出' : '预约配送' }}</strong>
          <small>{{ deliveryTime }}</small>
        </span>
        <span class="delivery-change">修改 <img src="/icons/chevron-right.svg" alt="" /></span>
      </button>

      <section class="order-card">
        <div class="order-shop">
          <img :src="cartShop.cover" alt="" />
          <strong>{{ cartShop.name }}</strong>
          <span>校园直送</span>
        </div>
        <div v-for="item in cartItems" :key="item.dishId" class="order-item">
          <img :src="item.image" alt="" />
          <span class="item-copy">
            <strong>{{ item.name }}</strong>
            <small>{{ item.spec }}</small>
          </span>
          <span class="item-right"><small>×{{ item.qty }}</small><strong>¥{{ item.price }}</strong></span>
        </div>
        <div class="order-subtotal">
          <span>共 {{ cartItems.reduce((sum, item) => sum + item.qty, 0) }} 件</span>
          <span>小计 <strong>¥{{ cartSubtotal.toFixed(2) }}</strong></span>
        </div>
      </section>

      <section class="options-card">
        <button class="option-row" @click="couponSheet = true">
          <span class="option-icon coupon-bg"><img src="/icons/coupon.svg" alt="" /></span>
          <span>优惠券</span>
          <b :class="{ highlight: currentCoupon }">{{ currentCoupon ? `${currentCoupon.title}  -¥${currentCoupon.amount}` : '选择优惠券' }}</b>
          <img src="/icons/chevron-right.svg" alt="" />
        </button>
        <div class="option-line"></div>
        <div class="option-row">
          <span class="option-icon remark-bg"><img src="/icons/edit.svg" alt="" /></span>
          <span>订单备注</span>
          <input v-model="remark" maxlength="40" placeholder="口味、门禁或送达要求" />
        </div>
        <div class="option-line"></div>
        <button class="option-row" @click="chooseTableware">
          <span class="option-icon tableware-bg"><img src="/icons/bag.svg" alt="" /></span>
          <span>餐具份数</span>
          <b>{{ tableware }}</b>
          <img src="/icons/chevron-right.svg" alt="" />
        </button>
        <div class="option-line"></div>
        <button class="option-row" @click="choosePay">
          <span class="option-icon pay-bg"><img src="/icons/wallet.svg" alt="" /></span>
          <span>支付方式</span>
          <b>{{ payMethod }}</b>
          <img src="/icons/chevron-right.svg" alt="" />
        </button>
      </section>

      <section class="bill-card">
        <div class="bill-head"><strong>费用明细</strong><small>DETAILS</small></div>
        <div class="bill-row"><span>商品小计</span><span>¥{{ cartSubtotal.toFixed(2) }}</span></div>
        <div class="bill-row"><span>配送费</span><span>¥{{ cartDelivery.toFixed(2) }}</span></div>
        <div v-if="cartDiscount" class="bill-row discount"><span>优惠券</span><span>-¥{{ cartDiscount }}</span></div>
        <div class="bill-total"><span>实付</span><strong><small>¥</small>{{ cartTotal.toFixed(2) }}</strong></div>
      </section>

      <div class="checkout-policy"><img src="/icons/shield.svg" alt="" />提交即同意《校园宿达服务协议》· 校园安心送 · 超时赔付</div>

      <div class="submit-bar">
        <div><span>合计</span><strong><small>¥</small>{{ cartTotal.toFixed(2) }}</strong><small v-if="cartDiscount">已省 ¥{{ cartDiscount }}</small></div>
        <button :class="{ loading: submitting }" @click="submit">{{ submitting ? '正在下单…' : '提交订单' }} <img v-if="!submitting" src="/icons/arrow.svg" alt="" /></button>
      </div>
    </template>

    <div v-else class="checkout-empty">
      <div><img src="/icons/bag.svg" alt="" /></div>
      <h3>购物车是空的</h3>
      <p>先去挑一份喜欢的餐品，再来结算吧</p>
      <button @click="router.push('/')">去首页点单</button>
    </div>

    <transition name="fade">
      <div v-if="extraSheet || couponSheet" class="sheet-mask" @click.self="extraSheet = ''; couponSheet = false">
        <div class="sheet option-sheet">
          <div class="sheet-handle"></div>
          <template v-if="couponSheet">
            <div class="option-sheet-head"><strong>选择优惠券</strong><button @click="couponSheet = false"><img src="/icons/close.svg" alt="" /></button></div>
            <button
              v-for="coupon in coupons.filter((item) => item.status === 'available' && item.type === '满减')"
              :key="coupon.id"
              class="coupon-choice"
              :class="{ disabled: cartSubtotal < coupon.threshold }"
              @click="chooseCoupon(coupon)"
            >
              <span>¥{{ coupon.amount }}</span>
              <strong>{{ coupon.title }}</strong>
              <small>{{ coupon.scope }}</small>
            </button>
          </template>

          <template v-else-if="extraSheet === 'delivery'">
            <div class="option-sheet-head"><strong>选择送达时间</strong><button @click="extraSheet = ''"><img src="/icons/close.svg" alt="" /></button></div>
            <button class="choice-row" @click="applyDelivery('now')"><span>立即送出</span><small>预计 12:35 送达</small></button>
            <button class="choice-row" @click="applyDelivery('12:30 - 12:45')"><span>预约配送</span><small>12:30 - 12:45</small></button>
            <button class="choice-row" @click="applyDelivery('18:00 - 18:15')"><span>预约配送</span><small>18:00 - 18:15</small></button>
          </template>

          <template v-else-if="extraSheet === 'pay'">
            <div class="option-sheet-head"><strong>选择支付方式</strong><button @click="extraSheet = ''"><img src="/icons/close.svg" alt="" /></button></div>
            <button class="choice-row" @click="payMethod = '微信支付'; extraSheet = ''"><span>微信支付</span><small>推荐</small></button>
            <button class="choice-row" @click="payMethod = '宿达余额'; extraSheet = ''"><span>宿达余额</span><small>¥36.50</small></button>
          </template>

          <template v-else>
            <div class="option-sheet-head"><strong>选择餐具份数</strong><button @click="extraSheet = ''"><img src="/icons/close.svg" alt="" /></button></div>
            <button v-for="option in ['无需餐具', '1 份餐具', '2 份餐具', '3 份餐具']" :key="option" class="choice-row" @click="tableware = option; extraSheet = ''"><span>{{ option }}</span><small>环保从这一餐开始</small></button>
          </template>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.checkout-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.16), transparent 30%),
    #f4f2ec;
  padding-bottom: 100px;
}
.checkout-head {
  padding: 8px 17px 0;
}
.checkout-head p {
  margin: 6px 0 0;
  color: #8b9289;
  font-size: 10.5px;
}
.address-card {
  position: relative;
  width: calc(100% - 32px);
  margin: 14px 16px 0;
  padding: 12px;
  border: 0;
  border-radius: 17px;
  background: #fff;
  display: flex;
  align-items: flex-start;
  gap: 8px;
  text-align: left;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.06);
}
.address-pin {
  width: 32px;
  height: 32px;
  border-radius: 10px;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.address-pin img {
  width: 16px;
  height: 16px;
}
.address-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.address-person {
  display: flex;
  align-items: center;
  gap: 5px;
}
.address-person strong {
  font-size: 14px;
  font-weight: 800;
}
.address-person > span {
  color: #7b847a;
  font-size: 10px;
}
.address-person b {
  padding: 2px 4px;
  border-radius: 3px;
  background: #f1f3ed;
  color: #798276;
  font-size: 7.5px;
  font-weight: 500;
}
.address-detail {
  margin-top: 5px;
  color: #283228;
  font-size: 13px;
  font-weight: 700;
}
.address-copy > small {
  margin-top: 3px;
  color: #a0a69d;
  font-size: 8.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.address-arrow {
  width: 12px;
  height: 12px;
  margin-top: 2px;
  opacity: 0.4;
}
.address-foot {
  position: absolute;
  left: 52px;
  right: 12px;
  bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 7px;
  border-top: 1px dashed #e8e5dc;
  font-size: 8px;
}
.address-foot > span {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #879084;
}
.address-foot i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--lime-deep);
}
.address-foot b {
  color: #18211a;
  font-weight: 700;
}
.address-card {
  padding-bottom: 34px;
}
.delivery-card {
  width: calc(100% - 32px);
  margin: 10px 16px 0;
  padding: 11px 12px;
  border: 0;
  border-radius: 14px;
  background: #14251b;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
  box-shadow: 0 7px 16px rgba(20, 37, 27, 0.14);
}
.delivery-icon {
  width: 29px;
  height: 29px;
  border-radius: 9px;
  background: rgba(215, 255, 94, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
}
.delivery-icon img {
  width: 15px;
  height: 15px;
  filter: invert(93%) sepia(44%) saturate(608%) hue-rotate(29deg) brightness(105%);
}
.delivery-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.delivery-copy strong {
  color: #fff;
  font-size: 12px;
}
.delivery-copy small {
  color: var(--lime);
  font-size: 9px;
}
.delivery-change {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #9aa696;
  font-size: 9px;
}
.delivery-change img {
  width: 9px;
  height: 9px;
  filter: invert(1);
  opacity: 0.5;
}
.order-card,
.options-card,
.bill-card {
  margin: 10px 16px 0;
  padding: 12px;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.04);
}
.order-shop {
  display: flex;
  align-items: center;
  gap: 6px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0eee8;
}
.order-shop img {
  width: 26px;
  height: 26px;
  border-radius: 6px;
}
.order-shop strong {
  font-size: 12px;
  font-weight: 800;
}
.order-shop span {
  margin-left: auto;
  padding: 2px 4px;
  border-radius: 3px;
  background: #f0f5e3;
  color: #637a29;
  font-size: 7px;
}
.order-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-top: 9px;
}
.order-item > img {
  width: 41px;
  height: 41px;
  border-radius: 8px;
  object-fit: cover;
}
.item-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.item-copy strong {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-copy small {
  color: #a1a79f;
  font-size: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.item-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 3px;
}
.item-right small {
  color: #9ca39a;
  font-size: 8.5px;
}
.item-right strong {
  font-size: 11px;
  font-weight: 800;
}
.order-subtotal {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 8px;
  border-top: 1px dashed #e8e5dc;
  color: #8e968d;
  font-size: 9px;
}
.order-subtotal strong {
  color: #18211a;
  font-size: 12px;
}
.options-card {
  padding: 0 12px;
}
.option-row {
  min-height: 52px;
  width: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
}
.option-icon {
  width: 27px;
  height: 27px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.option-icon img {
  width: 13px;
  height: 13px;
}
.coupon-bg { background: #fff0eb; }
.remark-bg { background: #f2f4ed; }
.tableware-bg { background: #eef2dd; }
.pay-bg { background: #e8f1f3; }
.option-row > span:nth-child(2) {
  width: 68px;
  font-size: 11px;
  font-weight: 600;
  color: #3f493f;
}
.option-row > b {
  flex: 1;
  color: #8e968d;
  font-size: 10px;
  font-weight: 400;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.option-row > b.highlight {
  color: #f05a3b;
  font-weight: 700;
}
.option-row > img {
  width: 11px;
  height: 11px;
  opacity: 0.35;
}
.option-row input {
  flex: 1;
  height: 36px;
  padding: 0 6px;
  border: 0;
  border-radius: 6px;
  background: #f8f7f2;
  outline: none;
  font-size: 9.5px;
  text-align: right;
}
.option-row input::placeholder {
  color: #b0b5ad;
}
.option-line {
  height: 1px;
  background: #f0eee8;
  margin-left: 34px;
}
.bill-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 6px;
}
.bill-head strong {
  font-size: 13.5px;
  font-weight: 800;
}
.bill-head small {
  color: #a9afa6;
  font-size: 7.5px;
  letter-spacing: 1px;
  font-weight: 700;
}
.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 28px;
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
.checkout-policy {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 14px 16px 0;
  color: #a2a89f;
  font-size: 8px;
}
.checkout-policy img {
  width: 10px;
  height: 10px;
  opacity: 0.6;
}
.submit-bar {
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
.submit-bar > div {
  display: flex;
  align-items: baseline;
  gap: 4px;
}
.submit-bar > div > span {
  color: #939e90;
  font-size: 9px;
}
.submit-bar > div > strong {
  color: #fff;
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.submit-bar > div > strong small {
  font-size: 10px;
}
.submit-bar > div > small {
  color: #a7bf75;
  font-size: 8px;
}
.submit-bar > button {
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
.submit-bar > button.loading {
  opacity: 0.65;
}
.submit-bar > button img {
  width: 14px;
  height: 14px;
}
.checkout-empty {
  padding: 70px 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.checkout-empty > div {
  width: 105px;
  height: 105px;
  border-radius: 50%;
  background: #e9eedb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.checkout-empty img {
  width: 45px;
  height: 45px;
  opacity: 0.7;
}
.checkout-empty h3 {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 800;
}
.checkout-empty p {
  margin: 7px 0 0;
  color: #8a9189;
  font-size: 11px;
}
.checkout-empty button {
  height: 40px;
  margin-top: 18px;
  padding: 0 22px;
  border: 0;
  border-radius: 20px;
  background: #18211a;
  color: var(--lime);
  font-size: 12px;
  font-weight: 700;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.22s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.option-sheet {
  color: #18211a;
}
.option-sheet-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
}
.option-sheet-head strong {
  font-size: 19px;
  font-weight: 900;
}
.option-sheet-head button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #eceae3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.option-sheet-head button img {
  width: 14px;
  height: 14px;
}
.choice-row {
  width: 100%;
  height: 47px;
  margin-top: 6px;
  padding: 0 12px;
  border: 0;
  border-radius: 11px;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.choice-row span {
  font-size: 11.5px;
  font-weight: 600;
}
.choice-row small {
  color: #9ba198;
  font-size: 9px;
}
.coupon-choice {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 6px;
  padding: 8px 10px;
  border: 0;
  border-radius: 10px;
  background: #fff;
  text-align: left;
}
.coupon-choice.disabled {
  opacity: 0.4;
}
.coupon-choice > span {
  padding: 5px 8px;
  border-radius: 6px;
  background: #18211a;
  color: var(--lime);
  font-size: 12px;
  font-weight: 900;
}
.coupon-choice strong {
  font-size: 11px;
  font-weight: 700;
}
.coupon-choice small {
  margin-left: auto;
  color: #9ba198;
  font-size: 8.5px;
}
</style>
