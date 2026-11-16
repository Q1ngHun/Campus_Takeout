<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { allOrders, addToCart, clearCart, getShop, markReviewed, toast } from '../store'

const router = useRouter()
const activeTab = ref('all')
const reviewOpen = ref(false)
const reviewOrder = ref(null)
const stars = ref(5)
const reviewText = ref('')
const selectedTags = ref(['准时送达', '包装完好', '味道超赞'])
const reviewOptions = ['准时送达', '包装完好', '味道超赞', '分量很足', '骑手有礼貌']
const starList = [1, 2, 3, 4, 5]

const tabs = computed(() => [
  { id: 'all', label: '全部', count: allOrders.value.length },
  { id: 'ongoing', label: '进行中', count: allOrders.value.filter((item) => ['delivering', 'preparing'].includes(item.status)).length },
  { id: 'review', label: '待评价', count: allOrders.value.filter((item) => item.status === 'done').length }
])

const filtered = computed(() => {
  if (activeTab.value === 'ongoing') return allOrders.value.filter((item) => ['delivering', 'preparing'].includes(item.status))
  if (activeTab.value === 'review') return allOrders.value.filter((item) => item.status === 'done')
  return allOrders.value
})

const activeOrder = computed(() => {
  if (activeTab.value === 'review') return null
  return filtered.value.find((item) => ['delivering', 'preparing'].includes(item.status)) || null
})

const displayOrders = computed(() => {
  return activeOrder.value ? filtered.value.filter((item) => item.id !== activeOrder.value.id) : filtered.value
})

function reorder(order) {
  const shop = getShop(order.shopId)
  if (!shop) return
  clearCart()
  order.items.forEach((item, index) => {
    const dish = shop.dishes.find((d) => d.name === item.name) || shop.dishes[index] || shop.dishes[0]
    addToCart(dish, shop, item.qty)
  })
  toast('已加入购物车')
  setTimeout(() => router.push('/cart'), 450)
}

function openReview(order) {
  reviewOrder.value = order
  stars.value = 5
  selectedTags.value = ['准时送达', '包装完好', '味道超赞']
  reviewText.value = ''
  reviewOpen.value = true
}

function toggleTag(tag) {
  if (selectedTags.value.includes(tag)) {
    selectedTags.value = selectedTags.value.filter((item) => item !== tag)
  } else {
    selectedTags.value.push(tag)
  }
}

function submitReview() {
  if (!reviewOrder.value) return
  markReviewed(reviewOrder.value.id)
  reviewOpen.value = false
  toast('感谢你的认真评价，+10 宿达积分')
}

function contactRider(order) {
  toast(`联系 ${order.rider.name} · ${order.rider.phone}`)
}

function goHome() {
  router.push('/')
}
</script>

<template>
  <main class="app-page orders-page">
    <header class="orders-head">
      <div>
        <span class="eyebrow">MY ORDERS · {{ allOrders.length }}</span>
        <h1 class="page-display">订单<span class="dot">.</span></h1>
      </div>
      <span class="ongoing-badge">
        <img src="/icons/scooter.svg" alt="" />
        {{ tabs[1].count }} 单进行中
      </span>
    </header>

    <div class="tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        class="tab"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}
        <span v-if="tab.count">{{ tab.count }}</span>
      </button>
    </div>

    <article v-if="activeOrder" class="active-card">
      <div class="active-top">
        <span class="live-status"><i></i>{{ activeOrder.statusText }}</span>
        <span class="order-id"># {{ activeOrder.id }}</span>
      </div>
      <div class="active-main">
        <div class="eta">
          <small>预计送达</small>
          <strong>{{ activeOrder.status === 'preparing' ? '12:20' : '12:35' }}<span>前</span></strong>
          <small>{{ activeOrder.statusNote }}</small>
        </div>
        <div class="route-art">
          <span class="route-halo"></span>
          <span class="route-dash"></span>
          <span class="route-pin start"><i></i></span>
          <span class="route-pin end"><img src="/icons/pin.svg" alt="" /></span>
          <span class="route-scooter"><img src="/icons/scooter.svg" alt="" /></span>
        </div>
      </div>
      <div class="active-shop">
        <img :src="activeOrder.shopCover" alt="" />
        <span>
          <strong>{{ activeOrder.shopName }}</strong>
          <small>{{ activeOrder.itemCount }} 件商品 · 实付 ¥{{ activeOrder.total }}</small>
        </span>
        <button @click="router.push(`/order/${activeOrder.id}`)">详情</button>
      </div>
      <div class="rider-row">
        <span class="rider-avatar">{{ activeOrder.rider.avatar }}</span>
        <span class="rider-copy">
          <strong>{{ activeOrder.rider.name }}</strong>
          <small>已取餐 · 正在飞奔</small>
        </span>
        <button class="contact" @click="contactRider(activeOrder)">
          <img src="/icons/phone.svg" alt="" />
          联系骑手
        </button>
      </div>
    </article>

    <div v-if="displayOrders.length" class="list-head">
      <strong>{{ activeTab === 'review' ? '等你评价' : '历史订单' }}</strong>
      <small>{{ displayOrders.length }} RECORDS</small>
    </div>

    <div class="order-list">
      <article
        v-for="order in displayOrders"
        :key="order.id"
        class="order-card"
        @click="router.push(`/order/${order.id}`)"
      >
        <div class="order-top">
          <img :src="order.shopCover" alt="" />
          <span class="order-shop">
            <strong>{{ order.shopName }}</strong>
            <small>{{ order.createdAt }} · {{ order.itemCount }} 件</small>
          </span>
          <span class="order-status" :class="`status-${order.status}`">{{ order.statusText }}</span>
        </div>
        <div class="order-goods">
          <div class="thumbs">
            <img v-for="(goods, index) in order.items.slice(0, 3)" :key="goods.name" :src="goods.image" :style="{ marginLeft: index ? '-9px' : 0 }" alt="" />
          </div>
          <span class="goods-copy">
            <strong>{{ order.items[0].name }}</strong>
            <small v-if="order.itemCount > 1">等 {{ order.itemCount }} 件商品</small>
            <em>{{ order.statusNote }}</em>
          </span>
          <span class="order-total">
            <small>实付</small>
            <strong>¥{{ order.total }}</strong>
          </span>
        </div>
        <div class="order-actions">
          <button class="ghost" @click.stop="reorder(order)">再来一单</button>
          <button
            v-if="order.status === 'done'"
            class="primary"
            @click.stop="openReview(order)"
          >去评价</button>
          <button v-else class="primary" @click.stop="router.push(`/order/${order.id}`)">订单详情</button>
        </div>
      </article>
    </div>

    <div v-if="!activeOrder && !displayOrders.length" class="empty-order">
      <div class="empty-art">
        <span></span>
        <img :src="`/icons/${activeTab === 'review' ? 'star' : 'order'}.svg`" alt="" />
        <b>✦</b>
      </div>
      <h3>{{ activeTab === 'review' ? '没有待评价的订单' : '还没有订单' }}</h3>
      <p>{{ activeTab === 'review' ? '认真吃饭的人，值得被好好记录。' : '去首页逛逛，第一顿好味正在等你。' }}</p>
      <button @click="goHome">去点单</button>
    </div>

    <footer v-if="activeOrder || displayOrders.length" class="orders-foot">
      <span></span>每一餐，都值得认真对待<span></span>
    </footer>

    <transition name="sheet-fade">
      <div v-if="reviewOpen" class="sheet-mask" @click.self="reviewOpen = false">
        <div class="sheet review-sheet">
          <div class="sheet-handle"></div>
          <div class="review-head">
            <span>
              <small>TELL US MORE</small>
              <strong>这顿饭，还满意吗？</strong>
            </span>
            <button class="sheet-close" @click="reviewOpen = false">
              <img src="/icons/close.svg" alt="" />
            </button>
          </div>
          <div class="review-shop">
            <img :src="reviewOrder.shopCover" alt="" />
            <span>{{ reviewOrder.shopName }}</span>
          </div>
          <div class="review-stars">
            <button
              v-for="star in starList"
              :key="star"
              :class="{ filled: star <= stars }"
              @click="stars = star"
            >★</button>
          </div>
          <div class="review-tags">
            <button
              v-for="tag in reviewOptions"
              :key="tag"
              :class="{ active: selectedTags.includes(tag) }"
              @click="toggleTag(tag)"
            >{{ tag }}</button>
          </div>
          <textarea v-model="reviewText" placeholder="说说这一餐的闪光点吧…"></textarea>
          <button class="review-submit" @click="submitReview">
            提交评价 <small>+10 宿达积分</small>
          </button>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.orders-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.22), transparent 30%),
    #f4f2ec;
}
.orders-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 17px 0;
}
.ongoing-badge {
  height: 32px;
  margin-bottom: 4px;
  padding: 0 10px;
  border-radius: 16px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 9.5px;
  font-weight: 700;
}
.ongoing-badge img {
  width: 14px;
  height: 14px;
}
.tabs {
  display: flex;
  margin: 17px 16px 0;
  padding: 3.5px;
  border-radius: 20px;
  background: #eae8e1;
}
.tab {
  flex: 1;
  height: 33px;
  border: 0;
  border-radius: 16.5px;
  background: transparent;
  color: #7d857d;
  font-size: 11.5px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.tab.active {
  background: #fff;
  color: #18211a;
  font-weight: 800;
  box-shadow: 0 3px 9px rgba(24, 33, 26, 0.08);
}
.tab span {
  min-width: 14px;
  height: 14px;
  padding: 0 3px;
  border-radius: 7px;
  background: var(--lime);
  color: #18211a;
  font-size: 8px;
  font-weight: 800;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.active-card {
  position: relative;
  margin: 14px 16px 0;
  padding: 14px;
  border-radius: 20px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(20, 37, 27, 0.2);
}
.active-card::after {
  content: "";
  position: absolute;
  right: -60px;
  top: -80px;
  width: 210px;
  height: 210px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 255, 94, 0.17), transparent 70%);
}
.active-top {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.live-status {
  display: flex;
  align-items: center;
  gap: 5px;
  color: var(--lime);
  font-size: 11px;
  font-weight: 800;
}
.live-status i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: var(--lime);
  box-shadow: 0 0 8px rgba(215, 255, 94, 0.8);
  animation: pulse 1.8s ease-in-out infinite;
}
@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.55; transform: scale(0.82); }
}
.order-id {
  color: #6e7d6b;
  font-size: 8px;
}
.active-main {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}
.eta {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.eta > small:first-child {
  color: #8f9d8d;
  font-size: 9.5px;
}
.eta strong {
  color: #fff;
  font-family: "Arial Black", sans-serif;
  font-size: 31px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1.1;
}
.eta strong span {
  margin-left: 2px;
  color: #8f9d8d;
  font-family: inherit;
  font-size: 10px;
  font-weight: 600;
}
.eta > small:last-child {
  color: #a5b1a1;
  font-size: 8.5px;
}
.route-art {
  position: relative;
  width: 133px;
  height: 80px;
  margin-right: -4px;
}
.route-halo {
  position: absolute;
  right: 5px;
  top: 5px;
  width: 70px;
  height: 70px;
  border: 1px solid rgba(215, 255, 94, 0.18);
  border-radius: 50%;
}
.route-dash {
  position: absolute;
  left: 21px;
  right: 21px;
  top: 44px;
  height: 1px;
  background-image: linear-gradient(90deg, rgba(215, 255, 94, 0.7) 50%, transparent 50%);
  background-size: 6px 1px;
  transform: rotate(-10deg);
}
.route-pin {
  position: absolute;
  width: 17px;
  height: 17px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.route-pin.start {
  left: 10px;
  top: 34px;
  background: #f4f2ec;
}
.route-pin.start i {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #18211a;
}
.route-pin.end {
  right: 9px;
  top: 17px;
  background: var(--lime);
}
.route-pin.end img {
  width: 13px;
  height: 13px;
}
.route-scooter {
  position: absolute;
  left: 54px;
  top: 20px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 0 0 5px rgba(215, 255, 94, 0.08);
}
.route-scooter img {
  width: 17px;
  height: 17px;
}
.active-shop {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 11px;
  padding: 6px;
  border-radius: 11px;
  background: rgba(255, 255, 255, 0.06);
}
.active-shop > img {
  width: 34px;
  height: 34px;
  border-radius: 8px;
}
.active-shop > span {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.active-shop strong {
  color: #fff;
  font-size: 11px;
  font-weight: 700;
}
.active-shop small {
  color: #8f9d8d;
  font-size: 8.5px;
}
.active-shop button {
  height: 25px;
  padding: 0 9px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 12px;
  background: transparent;
  color: var(--lime);
  font-size: 9px;
}
.rider-row {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 7px;
  margin-top: 9px;
  padding-top: 9px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.rider-avatar {
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background: #f1d7b7;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 900;
}
.rider-copy {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.rider-copy strong {
  color: #fff;
  font-size: 10.5px;
}
.rider-copy small {
  color: #7f8d7d;
  font-size: 8px;
}
.contact {
  height: 27px;
  padding: 0 9px;
  border: 0;
  border-radius: 14px;
  background: var(--lime);
  color: #18211a;
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 800;
}
.contact img {
  width: 11px;
  height: 11px;
}
.list-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 23px 17px 10px;
}
.list-head strong {
  font-size: 17px;
  font-weight: 800;
}
.list-head small {
  color: #a1a79f;
  font-size: 7.5px;
  letter-spacing: 2px;
  font-weight: 700;
}
.order-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 11px;
}
.order-card {
  padding: 12px;
  border-radius: 18px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(24, 33, 26, 0.04);
  cursor: pointer;
}
.order-top {
  display: flex;
  align-items: center;
  gap: 7px;
}
.order-top > img {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}
.order-shop {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.order-shop strong {
  font-size: 12.5px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.order-shop small {
  color: #9ba198;
  font-size: 8.5px;
}
.order-status {
  height: 21px;
  padding: 0 7px;
  border-radius: 11px;
  font-size: 8.5px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.status-delivering { background: #eef7d4; color: #54720c; }
.status-preparing { background: #fff0d8; color: #a26a12; }
.status-done { background: #fff0eb; color: #dc5b3e; }
.status-rated { background: #f1f2ed; color: #7a8279; }
.order-goods {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 10px;
  padding: 8px;
  border-radius: 11px;
  background: #f8f7f3;
}
.thumbs {
  display: flex;
}
.thumbs img {
  width: 39px;
  height: 39px;
  border: 1.5px solid #f8f7f3;
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
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.goods-copy small {
  color: #707970;
  font-size: 8.5px;
}
.goods-copy em {
  color: #a1a79f;
  font-size: 8px;
  font-style: normal;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.order-total {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 1px;
}
.order-total small {
  color: #9ba198;
  font-size: 8px;
}
.order-total strong {
  font-size: 15px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.order-actions {
  display: flex;
  justify-content: flex-end;
  gap: 6px;
  margin-top: 10px;
}
.order-actions button {
  height: 28px;
  padding: 0 13px;
  border-radius: 14px;
  font-size: 10px;
  font-weight: 700;
}
.order-actions .ghost {
  border: 1px solid #e3e1d9;
  background: #fff;
  color: #4b554b;
}
.order-actions .primary {
  border: 0;
  background: #18211a;
  color: var(--lime);
}
.empty-order {
  padding: 46px 30px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}
.empty-art {
  position: relative;
  width: 118px;
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-art > span {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e9eedb;
}
.empty-art img {
  position: relative;
  width: 46px;
  height: 46px;
  opacity: 0.7;
}
.empty-art b {
  position: absolute;
  right: 2px;
  top: 8px;
  color: var(--lime-deep);
  font-size: 24px;
}
.empty-order h3 {
  margin: 15px 0 0;
  font-size: 18px;
  font-weight: 800;
}
.empty-order p {
  max-width: 250px;
  margin: 7px 0 0;
  color: #8a9189;
  font-size: 11.5px;
  line-height: 1.7;
}
.empty-order button {
  height: 40px;
  margin-top: 19px;
  padding: 0 23px;
  border: 0;
  border-radius: 20px;
  background: #18211a;
  color: var(--lime);
  font-size: 12px;
  font-weight: 700;
}
.orders-foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 23px 16px 8px;
  color: #b0b5ad;
  font-size: 8px;
  letter-spacing: 0.5px;
}
.orders-foot span {
  width: 27px;
  height: 1px;
  background: #dcd9d0;
}
.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.22s ease;
}
.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
.review-sheet {
  color: #18211a;
}
.review-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.review-head > span {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.review-head small {
  color: #9ba198;
  font-size: 8px;
  letter-spacing: 2px;
  font-weight: 700;
}
.review-head strong {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.sheet-close {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #eceae3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-close img {
  width: 14px;
  height: 14px;
}
.review-shop {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: #5f685f;
  font-size: 11px;
  font-weight: 700;
}
.review-shop img {
  width: 27px;
  height: 27px;
  border-radius: 7px;
}
.review-stars {
  display: flex;
  gap: 7px;
  margin-top: 15px;
}
.review-stars button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #dedbd2;
  font-size: 32px;
  line-height: 1;
}
.review-stars button.filled {
  color: var(--lime-deep);
}
.review-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 13px;
}
.review-tags button {
  height: 30px;
  padding: 0 12px;
  border: 0;
  border-radius: 15px;
  background: #ecebe4;
  color: #6e776e;
  font-size: 10.5px;
}
.review-tags button.active {
  background: #18211a;
  color: var(--lime);
  font-weight: 700;
}
textarea {
  width: 100%;
  height: 70px;
  margin-top: 11px;
  padding: 10px;
  border: 0;
  border-radius: 12px;
  background: #fff;
  resize: none;
  outline: none;
  font-size: 11.5px;
  line-height: 1.6;
}
textarea::placeholder {
  color: #b1b6ae;
}
.review-submit {
  width: 100%;
  height: 47px;
  margin-top: 12px;
  border: 0;
  border-radius: 24px;
  background: #18211a;
  color: var(--lime);
  font-size: 13px;
  font-weight: 800;
}
.review-submit small {
  margin-left: 5px;
  padding: 3px 6px;
  border-radius: 7px;
  background: rgba(215, 255, 94, 0.14);
  font-size: 8px;
}
</style>
