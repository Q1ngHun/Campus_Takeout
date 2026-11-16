<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import { addToCart, clearCart, getOrder, getShop, markReviewed, toast } from '../store'

const route = useRoute()
const router = useRouter()
const order = computed(() => getOrder(route.params.id))
const success = computed(() => route.query.success === '1')

const statusTitle = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'preparing') return '商家正在制作'
  if (order.value.status === 'delivering') return '骑手正在飞奔'
  if (order.value.status === 'done') return '订单已送达'
  if (order.value.status === 'rated') return '订单已完成'
  return order.value.statusText
})

const statusDesc = computed(() => {
  if (!order.value) return ''
  if (order.value.status === 'preparing') return '预计 12:20 前送达 · 请耐心等待'
  if (order.value.status === 'delivering') return '预计 12:35 前送达 · 距离你 800m'
  if (order.value.status === 'done') return '希望这一餐，刚好合你胃口'
  if (order.value.status === 'rated') return '感谢你的认真评价'
  return order.value.statusNote
})

const progress = computed(() => {
  if (!order.value) return []
  const steps = ['已支付', '商家接单', '制作中', '配送中', '已送达']
  const indexMap = { preparing: 2, delivering: 3, done: 4, rated: 4 }
  const current = indexMap[order.value.status] ?? 2
  return steps.map((name, index) => ({ name, done: index <= current, current: index === current }))
})

const riderVisible = computed(() => order.value && ['preparing', 'delivering'].includes(order.value.status))

function reorder() {
  const shop = getShop(order.value.shopId)
  if (!shop) return
  clearCart()
  order.value.items.forEach((item, index) => {
    const dish = shop.dishes.find((d) => d.name === item.name) || shop.dishes[index] || shop.dishes[0]
    addToCart(dish, shop, item.qty)
  })
  toast('已加入购物车')
  setTimeout(() => router.push('/cart'), 450)
}

function contactRider() {
  toast(`联系 ${order.value.rider.name} · ${order.value.rider.phone}`)
}

function review() {
  markReviewed(order.value.id)
  toast('感谢评价，+10 宿达积分')
  router.push('/orders')
}

function copyId() {
  navigator.clipboard?.writeText(order.value.id)
  toast('订单编号已复制')
}
</script>

<template>
  <main class="sub-page detail-page">
    <SubNav title="订单详情">
      <template #action>
        <button class="share-btn" @click="toast('分享链接已复制')"><img src="/icons/share.svg" alt="" /></button>
      </template>
    </SubNav>

    <template v-if="order">
      <div v-if="success" class="success-banner">
        <span class="success-icon"><img src="/icons/check.svg" alt="" /></span>
        <span><strong>下单成功</strong><small>商家已收到订单，正在为你准备</small></span>
        <b>✦</b>
      </div>

      <section class="detail-hero">
        <div class="hero-glow"></div>
        <div class="detail-top">
          <span class="live-status"><i></i>{{ order.statusText }}</span>
          <span class="detail-id"># {{ order.id }}</span>
        </div>
        <div class="detail-title-row">
          <h1>{{ statusTitle }}</h1>
          <span>CAMPUS</span>
        </div>
        <p>{{ statusDesc }}</p>

        <div class="progress-rail">
          <div v-for="(step, index) in progress" :key="step.name" class="progress-step">
            <div class="step-track">
              <span class="step-dot" :class="{ done: step.done, current: step.current }"><i></i></span>
              <span v-if="index < progress.length - 1" class="step-line" :class="{ done: step.done }"></span>
            </div>
            <small :class="{ done: step.done }">{{ step.name }}</small>
          </div>
        </div>

        <button class="detail-shop" @click="router.push(`/shop/${order.shopId}`)">
          <img :src="order.shopCover" alt="" />
          <span><strong>{{ order.shopName }}</strong><small>{{ order.itemCount }} 件商品 · 实付 ¥{{ order.total }}</small></span>
          <img class="shop-arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
      </section>

      <div v-if="riderVisible" class="rider-card">
        <span class="rider-avatar">{{ order.rider.avatar }}</span>
        <span class="rider-copy">
          <strong>{{ order.rider.name }} <b>校园骑手</b></strong>
          <small>{{ order.status === 'preparing' ? '商家出餐后立即为你配送' : '已取餐 · 正在向你飞奔' }}</small>
        </span>
        <button @click="contactRider"><img src="/icons/phone.svg" alt="" />联系</button>
      </div>

      <section v-if="order.timeline?.length" class="timeline-card">
        <div class="card-head"><strong>配送动态</strong><small>LIVE TRACKING</small></div>
        <div v-for="(item, index) in order.timeline" :key="item.text" class="timeline-item">
          <span class="timeline-rail"><i :class="{ active: index === 0, done: item.done }"></i><b v-if="index < order.timeline.length - 1"></b></span>
          <span class="timeline-copy"><strong :class="{ active: index === 0 }">{{ item.text }}</strong><small>{{ item.time || '待更新' }}</small></span>
        </div>
      </section>

      <div class="address-card">
        <span class="address-icon"><img src="/icons/pin.svg" alt="" /></span>
        <span class="address-copy"><small>收货地址</small><strong>{{ order.address }}</strong></span>
        <span class="address-time">预计送达<br /><b>12:35</b></span>
      </div>

      <section class="goods-card">
        <div class="card-head"><strong>餐品清单</strong><small>{{ order.itemCount }} ITEMS</small></div>
        <div v-for="item in order.items" :key="item.name" class="goods-item">
          <img :src="item.image" alt="" />
          <span class="goods-copy"><strong>{{ item.name }}</strong><small>{{ item.spec }}</small></span>
          <span class="goods-right"><small>×{{ item.qty }}</small><strong>¥{{ item.price }}</strong></span>
        </div>
        <div class="bill-line"></div>
        <div class="bill-row"><span>商品小计</span><span>¥{{ order.total }}</span></div>
        <div class="bill-row"><span>配送费</span><span>已含</span></div>
        <div class="bill-row total"><span>实付金额</span><strong>¥{{ order.total }}</strong></div>
      </section>

      <section class="info-card">
        <div class="card-head"><strong>订单信息</strong><small>ORDER INFO</small></div>
        <div class="info-row"><span>下单时间</span><b>{{ order.createdAt }}</b></div>
        <div class="info-row"><span>订单编号</span><b class="copy-id">{{ order.id }}<button @click="copyId">复制</button></b></div>
        <div class="info-row"><span>支付方式</span><b>{{ order.payMethod || '微信支付' }}</b></div>
        <div v-if="order.remark" class="info-row"><span>订单备注</span><b>{{ order.remark }}</b></div>
        <div class="info-row"><span>配送方式</span><b>校园直送</b></div>
      </section>

      <div class="detail-service">
        <button @click="toast('校园直送专线 400-0712-326')"><span><img src="/icons/headset.svg" alt="" /></span>联系商家</button>
        <button @click="contactRider"><span><img src="/icons/scooter.svg" alt="" /></span>配送咨询</button>
        <button @click="toast('订单记录已保留')"><span><img src="/icons/trash.svg" alt="" /></span>删除订单</button>
      </div>

      <div class="detail-actions">
        <button class="ghost" @click="reorder">再来一单</button>
        <button v-if="['delivering', 'preparing'].includes(order.status)" class="primary" @click="contactRider"><img src="/icons/phone.svg" alt="" />联系骑手</button>
        <button v-else-if="order.status === 'done'" class="primary" @click="review"><img src="/icons/star.svg" alt="" />去评价</button>
        <button v-else class="primary" @click="reorder">再来一单 <img src="/icons/arrow.svg" alt="" /></button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.detail-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.18), transparent 30%),
    #f4f2ec;
  padding-bottom: 94px;
}
.share-btn {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.share-btn img {
  width: 15px;
  height: 15px;
}
.success-banner {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 4px 16px 0;
  padding: 10px 11px;
  border-radius: 13px;
  background: var(--lime);
  animation: rise 0.4s ease both;
}
@keyframes rise {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.success-icon {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.success-icon img {
  width: 14px;
  height: 14px;
}
.success-banner > span:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.success-banner strong {
  color: #18211a;
  font-size: 12.5px;
  font-weight: 900;
}
.success-banner small {
  color: #586632;
  font-size: 9px;
}
.success-banner b {
  color: #586632;
  font-size: 19px;
}
.detail-hero {
  position: relative;
  margin: 10px 16px 0;
  padding: 14px;
  border-radius: 19px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(20, 37, 27, 0.18);
}
.hero-glow {
  position: absolute;
  right: -60px;
  top: -80px;
  width: 200px;
  height: 200px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 255, 94, 0.17), transparent 68%);
}
.detail-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.live-status {
  display: flex;
  align-items: center;
  gap: 4px;
  color: var(--lime);
  font-size: 10px;
  font-weight: 700;
}
.live-status i {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: var(--lime);
}
.detail-id {
  color: #6e7d6b;
  font-size: 8px;
}
.detail-title-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
}
.detail-title-row h1 {
  margin: 0;
  color: #fff;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: -1px;
}
.detail-title-row > span {
  padding: 2px 4px;
  border-radius: 3px;
  background: rgba(215, 255, 94, 0.12);
  color: var(--lime);
  font-size: 6.5px;
  letter-spacing: 0.5px;
  font-weight: 700;
}
.detail-hero > p {
  position: relative;
  z-index: 2;
  margin: 4px 0 0;
  color: #9ba997;
  font-size: 9.5px;
}
.progress-rail {
  position: relative;
  z-index: 2;
  display: flex;
  margin-top: 14px;
}
.progress-step {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.step-track {
  position: relative;
  width: 100%;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-dot {
  position: relative;
  z-index: 2;
  width: 11px;
  height: 11px;
  border: 1px solid #455244;
  border-radius: 50%;
  background: #334034;
  display: flex;
  align-items: center;
  justify-content: center;
}
.step-dot i {
  width: 3px;
  height: 3px;
  border-radius: 50%;
  background: transparent;
}
.step-dot.done {
  border-color: var(--lime);
  background: var(--lime);
}
.step-dot.done i {
  background: #14251b;
}
.step-dot.current {
  box-shadow: 0 0 0 3.5px rgba(215, 255, 94, 0.13);
}
.step-line {
  position: absolute;
  left: 50%;
  width: 100%;
  height: 1px;
  background: #334034;
}
.step-line.done {
  background: var(--lime);
}
.progress-step small {
  margin-top: 4px;
  color: #647361;
  font-size: 7.5px;
}
.progress-step small.done {
  color: var(--lime);
}
.detail-shop {
  position: relative;
  z-index: 2;
  width: 100%;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 12px;
  padding: 6px;
  border: 0;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.06);
  text-align: left;
}
.detail-shop > img:first-child {
  width: 29px;
  height: 29px;
  border-radius: 7px;
}
.detail-shop > span {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.detail-shop strong {
  color: #fff;
  font-size: 10.5px;
}
.detail-shop small {
  color: #81907f;
  font-size: 8px;
}
.shop-arrow {
  width: 10px;
  height: 10px;
  filter: invert(1);
  opacity: 0.4;
}
.rider-card {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 16px 0;
  padding: 10px 11px;
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 5px 15px rgba(24, 33, 26, 0.045);
}
.rider-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #f1d7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
}
.rider-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rider-copy strong {
  font-size: 12px;
  font-weight: 800;
}
.rider-copy strong b {
  margin-left: 4px;
  padding: 2px 4px;
  border-radius: 3px;
  background: #f1f3ed;
  color: #7d8877;
  font-size: 7px;
  font-weight: 500;
}
.rider-copy small {
  color: #9da39a;
  font-size: 8.5px;
}
.rider-card > button {
  height: 28px;
  padding: 0 9px;
  border: 0;
  border-radius: 14px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9.5px;
  font-weight: 700;
}
.rider-card > button img {
  width: 11px;
  height: 11px;
}
.timeline-card,
.goods-card,
.info-card {
  margin: 10px 16px 0;
  padding: 12px;
  border-radius: 17px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.04);
}
.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  margin-bottom: 9px;
}
.card-head strong {
  font-size: 13.5px;
  font-weight: 800;
}
.card-head small {
  color: #a9afa6;
  font-size: 7.5px;
  letter-spacing: 1px;
  font-weight: 700;
}
.timeline-item {
  display: flex;
  gap: 7px;
  min-height: 31px;
}
.timeline-rail {
  width: 11px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 4px;
}
.timeline-rail i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: #d8d6ce;
  flex: 0 0 auto;
}
.timeline-rail i.done {
  background: #bbc1b8;
}
.timeline-rail i.active {
  background: var(--lime-deep);
  box-shadow: 0 0 0 2.5px rgba(185, 232, 62, 0.2);
}
.timeline-rail b {
  flex: 1;
  width: 1px;
  margin: 2px 0;
  background: #e9e7e0;
}
.timeline-copy {
  flex: 1;
  display: flex;
  justify-content: space-between;
  gap: 5px;
  padding-bottom: 8px;
}
.timeline-copy strong {
  color: #8f978d;
  font-size: 10.5px;
  font-weight: 400;
}
.timeline-copy strong.active {
  color: #283228;
  font-weight: 800;
}
.timeline-copy small {
  color: #b0b5ad;
  font-size: 8px;
}
.address-card {
  display: flex;
  align-items: flex-start;
  gap: 7px;
  margin: 10px 16px 0;
  padding: 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.04);
}
.address-icon {
  width: 29px;
  height: 29px;
  border-radius: 9px;
  background: #eef6d8;
  display: flex;
  align-items: center;
  justify-content: center;
}
.address-icon img {
  width: 14px;
  height: 14px;
}
.address-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.address-copy small {
  color: #9ba198;
  font-size: 8.5px;
}
.address-copy strong {
  color: #283228;
  font-size: 11.5px;
  font-weight: 700;
  line-height: 1.45;
}
.address-time {
  color: #a3a99f;
  font-size: 8px;
  text-align: right;
  line-height: 1.7;
}
.address-time b {
  color: #283228;
}
.goods-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding-bottom: 9px;
}
.goods-item > img {
  width: 44px;
  height: 44px;
  border-radius: 9px;
  object-fit: cover;
}
.goods-copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.goods-copy strong {
  font-size: 11px;
  font-weight: 700;
}
.goods-copy small {
  color: #a0a69d;
  font-size: 8px;
}
.goods-right {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 2px;
}
.goods-right small {
  color: #a0a69d;
  font-size: 8.5px;
}
.goods-right strong {
  font-size: 10.5px;
  font-weight: 700;
}
.bill-line {
  height: 1px;
  background: #eeece5;
  margin: 2px 0 5px;
}
.bill-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 25px;
  color: #7f887e;
  font-size: 9.5px;
}
.bill-row.total {
  margin-top: 4px;
  padding-top: 7px;
  border-top: 1px dashed #e8e5dc;
  color: #283228;
  font-weight: 700;
}
.bill-row.total strong {
  font-size: 17px;
  font-weight: 900;
}
.info-row {
  display: flex;
  justify-content: space-between;
  gap: 10px;
  min-height: 27px;
  padding: 4px 0;
  color: #7c857b;
  font-size: 9.5px;
}
.info-row > span {
  flex: 0 0 auto;
  color: #9ba198;
}
.info-row > b {
  color: #3d473e;
  font-weight: 500;
  text-align: right;
  word-break: break-all;
}
.copy-id button {
  margin-left: 5px;
  padding: 1px 4px;
  border: 0;
  border-radius: 3px;
  background: #f2f3ee;
  color: #7e8778;
  font-size: 7.5px;
}
.detail-service {
  display: flex;
  margin: 10px 16px 0;
  padding: 11px 5px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 5px 15px rgba(24, 33, 26, 0.04);
}
.detail-service button {
  flex: 1;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: #667066;
  font-size: 8.5px;
}
.detail-service button span {
  width: 27px;
  height: 27px;
  border-radius: 8px;
  background: #f5f5ef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.detail-service img {
  width: 13px;
  height: 13px;
}
.detail-actions {
  position: fixed;
  z-index: 80;
  left: 16px;
  right: 16px;
  bottom: 16px;
  display: flex;
  gap: 6px;
  padding: 6px;
  border-radius: 25px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(24, 33, 26, 0.12);
}
.detail-actions button {
  height: 38px;
  border-radius: 19px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 11px;
  font-weight: 700;
}
.detail-actions img {
  width: 12px;
  height: 12px;
}
.detail-actions .ghost {
  flex: 1;
  border: 1px solid #e4e1d9;
  background: #fff;
  color: #3f493f;
}
.detail-actions .primary {
  flex: 1.4;
  border: 0;
  background: #18211a;
  color: var(--lime);
}
</style>
