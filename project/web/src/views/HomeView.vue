<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MerchantCard from '../components/MerchantCard.vue'
import { addToCart, categories, merchants, toast } from '../store'

const router = useRouter()
const activeCategory = ref('all')
const greeting = computed(() => {
  const hour = new Date().getHours()
  if (hour < 10) return '早上好'
  if (hour < 14) return '中午好'
  if (hour < 18) return '下午好'
  return '晚上好'
})

const visibleMerchants = computed(() => {
  if (activeCategory.value === 'all') return merchants
  return merchants.filter((shop) => shop.category.includes(activeCategory.value))
})

const hotMerchants = merchants.slice(0, 4)
const featureShop = merchants[0]

function addFromCard(shop) {
  addToCart(shop.dishes[0], shop)
}

function addFeature() {
  addToCart(featureShop.dishes[0], featureShop)
}

function showLocation() {
  toast('当前配送至：北苑 · 7 号楼')
}
</script>

<template>
  <main class="app-page home-page">
    <header class="home-top">
      <div class="brand">
        <div class="brand-mark">
          宿
          <i></i>
        </div>
        <div>
          <strong>校园宿达</strong>
          <small>SUDA CAMPUS</small>
        </div>
      </div>
      <div class="top-actions">
        <button class="location" @click="showLocation">
          <img src="/icons/pin.svg" alt="" />
          北苑 · 7号楼
          <img class="chevron" src="/icons/chevron-down.svg" alt="" />
        </button>
        <button class="icon-button" @click="toast('暂无新消息')">
          <img src="/icons/bell.svg" alt="" />
          <i></i>
        </button>
      </div>
    </header>

    <div class="welcome">
      <strong>{{ greeting }}，小满</strong>
      <span>今天也要好好吃饭。</span>
    </div>

    <button class="search-bar" @click="router.push('/search')">
      <img src="/icons/search.svg" alt="" />
      <span>搜宿舍楼下的好吃的</span>
      <i></i>
      <b><img src="/icons/scan.svg" alt="" /></b>
    </button>

    <section class="hero">
      <div class="hero-glow"></div>
      <div class="hero-copy">
        <div class="hero-eyebrow"><i></i>CAMPUS EXPRESS · 15 MIN</div>
        <h1>把好吃的，<em>送到楼下。</em></h1>
        <div class="hero-social">
          <div class="avatar-stack">
            <span class="a">满</span><span class="b">周</span><span class="c">+</span>
          </div>
          <span>2,600+ 同学正在点单</span>
        </div>
      </div>
      <div class="hero-art">
        <div class="hero-ring"></div>
        <img :src="featureShop.cover" alt="今日推荐" />
        <div class="hero-sticker">
          <small>今日灵感</small>
          <strong>山野拌饭</strong>
        </div>
        <div class="hero-price">
          <span>¥<b>28.8</b></span>
          <small>起 · 15min 达</small>
        </div>
      </div>
      <button class="hero-cta" @click="addFeature">
        立即点单
        <span><img src="/icons/arrow.svg" alt="" /></span>
      </button>
    </section>

    <div class="category-grid">
      <button
        v-for="category in categories"
        :key="category.id"
        class="category-item"
        :class="{ active: activeCategory === category.id }"
        @click="activeCategory = category.id"
      >
        <span class="cat-bubble" :class="`tone-${category.tone}`">
          <img :src="`/icons/${category.icon}.svg`" alt="" />
          <i v-if="activeCategory === category.id"></i>
        </span>
        <span>{{ category.name }}</span>
      </button>
    </div>

    <button class="promo-strip" @click="router.push('/coupons')">
      <span class="promo-left">
        <b>NEW</b>
        <span>
          <strong>开学季 · 宿舍拼单</strong>
          <small>满 20 减 6，新客再减 3 元</small>
        </span>
      </span>
      <span class="promo-cta">去领券 <img src="/icons/arrow.svg" alt="" /></span>
    </button>

    <div class="section-row">
      <div>
        <h2>今日热卖</h2>
        <span class="section-en">HOT NOW</span>
      </div>
      <button class="section-link" @click="router.push('/search')">全部 <img src="/icons/arrow.svg" alt="" /></button>
    </div>

    <div class="hot-scroll">
      <div class="hot-list">
        <button
          v-for="(shop, index) in hotMerchants"
          :key="shop.id"
          class="hot-card"
          @click="router.push(`/shop/${shop.id}`)"
        >
          <img :src="shop.cover" :alt="shop.name" />
          <span class="hot-gradient"></span>
          <span class="hot-index">0{{ index + 1 }}</span>
          <span class="hot-rating">★ {{ shop.rating }}</span>
          <span class="hot-bottom">
            <strong>{{ shop.name }}</strong>
            <span>{{ shop.hot[0] }} <b>{{ shop.time }} min</b></span>
          </span>
        </button>
      </div>
    </div>

    <div class="feed-head">
      <div>
        <h2>附近好味</h2>
        <span class="section-en">AROUND CAMPUS</span>
      </div>
      <span class="feed-filter">综合排序 <img src="/icons/chevron-down.svg" alt="" /></span>
    </div>

    <div class="feed-list">
      <MerchantCard
        v-for="shop in visibleMerchants"
        :key="shop.id"
        :merchant="shop"
        @add="addFromCard"
      />
    </div>

    <div class="feed-end">
      <span></span>
      <small>END · 今日好味已加载</small>
      <span></span>
    </div>
  </main>
</template>

<style scoped>
.home-page {
  overflow: hidden;
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.18), transparent 28%),
    #f4f2ec;
}
.home-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px 0;
}
.brand {
  display: flex;
  align-items: center;
  gap: 7px;
}
.brand-mark {
  position: relative;
  width: 34px;
  height: 34px;
  border-radius: 11px;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  font-weight: 900;
  box-shadow: 0 5px 13px rgba(185, 232, 62, 0.28);
}
.brand-mark i {
  position: absolute;
  right: 4px;
  top: 4px;
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: #18211a;
}
.brand > div:last-child {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.brand strong {
  font-size: 14px;
  font-weight: 900;
  letter-spacing: 0.5px;
}
.brand small {
  color: #9aa096;
  font-size: 6px;
  font-weight: 700;
  letter-spacing: 2px;
}
.top-actions {
  display: flex;
  align-items: center;
  gap: 6px;
}
.location {
  height: 29px;
  padding: 0 8px;
  border: 0;
  border-radius: 15px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 3px;
  color: #3d473e;
  font-size: 9px;
  font-weight: 600;
  box-shadow: 0 4px 12px rgba(24, 33, 26, 0.05);
}
.location img {
  width: 13px;
  height: 13px;
}
.location .chevron {
  width: 9px;
  height: 9px;
  opacity: 0.55;
}
.icon-button {
  position: relative;
  width: 29px;
  height: 29px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(24, 33, 26, 0.05);
}
.icon-button img {
  width: 15px;
  height: 15px;
}
.icon-button i {
  position: absolute;
  right: 6px;
  top: 6px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ff6b4a;
  border: 1px solid #fff;
}
.welcome {
  display: flex;
  align-items: baseline;
  gap: 7px;
  padding: 15px 16px 0;
}
.welcome strong {
  font-size: 20px;
  font-weight: 900;
  letter-spacing: -0.6px;
}
.welcome span {
  color: #8b9289;
  font-size: 11px;
}
.search-bar {
  height: 43px;
  margin: 13px 16px 0;
  padding: 0 8px 0 13px;
  border: 0;
  border-radius: 22px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 8px;
  box-shadow: 0 6px 17px rgba(24, 33, 26, 0.05);
  width: calc(100% - 32px);
}
.search-bar > img {
  width: 16px;
  height: 16px;
}
.search-bar > span {
  flex: 1;
  text-align: left;
  color: #a2a8a0;
  font-size: 12px;
}
.search-bar > i {
  width: 1px;
  height: 15px;
  background: #e8e6df;
}
.search-bar > b {
  width: 30px;
  height: 30px;
  margin-left: 2px;
  border-radius: 50%;
  background: #f5f5ef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-bar > b img {
  width: 15px;
  height: 15px;
}
.hero {
  position: relative;
  height: 200px;
  margin: 14px 16px 0;
  padding: 16px;
  border-radius: 20px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(20, 37, 27, 0.17);
}
.hero-glow {
  position: absolute;
  right: -70px;
  top: -70px;
  width: 220px;
  height: 220px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(215, 255, 94, 0.2), transparent 68%);
}
.hero-copy {
  position: relative;
  z-index: 3;
  width: 60%;
}
.hero-eyebrow {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #a7b2a2;
  font-size: 7px;
  font-weight: 700;
  letter-spacing: 1.3px;
}
.hero-eyebrow i {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: var(--lime);
}
.hero h1 {
  margin: 12px 0 0;
  color: #fff;
  font-size: 27px;
  font-weight: 900;
  line-height: 1.16;
  letter-spacing: -1.4px;
}
.hero h1 em {
  display: block;
  font-style: normal;
  color: var(--lime);
}
.hero-social {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 13px;
  color: #aab4a6;
  font-size: 9px;
}
.avatar-stack {
  display: flex;
}
.avatar-stack span {
  width: 19px;
  height: 19px;
  margin-left: -4px;
  border: 1px solid #14251b;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #18211a;
  font-size: 8px;
  font-weight: 800;
}
.avatar-stack .a {
  margin-left: 0;
  background: var(--lime);
}
.avatar-stack .b { background: #f1d7b7; }
.avatar-stack .c { background: #fff; }
.hero-art {
  position: absolute;
  right: -28px;
  top: 15px;
  width: 158px;
  height: 158px;
}
.hero-ring {
  position: absolute;
  inset: 5px;
  border: 1px solid rgba(215, 255, 94, 0.4);
  border-radius: 50%;
}
.hero-art > img {
  position: absolute;
  left: 19px;
  top: 19px;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid rgba(255, 255, 255, 0.1);
}
.hero-sticker {
  position: absolute;
  left: -8px;
  top: 20px;
  width: 61px;
  padding: 5px 6px;
  border-radius: 7px;
  background: #f4f2ec;
  transform: rotate(-8deg);
  box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.hero-sticker small {
  color: #8a9189;
  font-size: 7px;
  font-weight: 600;
}
.hero-sticker strong {
  color: #18211a;
  font-size: 11px;
  font-weight: 900;
  white-space: nowrap;
}
.hero-price {
  position: absolute;
  right: 42px;
  bottom: 2px;
  padding: 5px 8px;
  border-radius: 9px;
  background: var(--lime);
  transform: rotate(4deg);
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 9px rgba(0, 0, 0, 0.18);
}
.hero-price span {
  color: #18211a;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
}
.hero-price span b {
  font-size: 15px;
}
.hero-price small {
  color: #4d5a44;
  font-size: 6.5px;
  font-weight: 600;
  margin-top: 2px;
}
.hero-cta {
  position: absolute;
  z-index: 4;
  left: 16px;
  bottom: 14px;
  height: 32px;
  padding: 0 6px 0 13px;
  border: 0;
  border-radius: 16px;
  background: var(--lime);
  color: #18211a;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 900;
}
.hero-cta span {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.hero-cta img {
  width: 11px;
  height: 11px;
}
.category-grid {
  display: flex;
  justify-content: space-between;
  padding: 17px 15px 0;
}
.category-item {
  width: 62px;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.cat-bubble {
  position: relative;
  width: 47px;
  height: 47px;
  border-radius: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.22s ease, box-shadow 0.22s ease;
}
.cat-bubble img {
  width: 24px;
  height: 24px;
}
.category-item.active .cat-bubble {
  transform: translateY(-2px);
  box-shadow: 0 6px 13px rgba(24, 33, 26, 0.12);
}
.cat-bubble i {
  position: absolute;
  right: 3px;
  top: 3px;
  width: 7px;
  height: 7px;
  border: 1.5px solid #fff;
  border-radius: 50%;
  background: #18211a;
}
.category-item > span:last-child {
  color: #7d857d;
  font-size: 10px;
  white-space: nowrap;
}
.category-item.active > span:last-child {
  color: #18211a;
  font-weight: 800;
}
.tone-lime { background: #e7f4c7; }
.tone-sand { background: #f3e8d6; }
.tone-mint { background: #dcefe5; }
.tone-peach { background: #ffe2d6; }
.tone-rose { background: #f6e0e5; }
.promo-strip {
  width: calc(100% - 32px);
  height: 59px;
  margin: 16px 16px 0;
  padding: 0 11px 0 9px;
  border: 0;
  border-radius: 14px;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
}
.promo-left {
  display: flex;
  align-items: center;
  gap: 7px;
}
.promo-left > b {
  width: 33px;
  height: 21px;
  border-radius: 11px;
  background: #18211a;
  color: var(--lime);
  font-size: 7px;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.promo-left > span {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.promo-left strong {
  color: #18211a;
  font-size: 13px;
  font-weight: 900;
}
.promo-left small {
  color: #55633c;
  font-size: 9px;
}
.promo-cta {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #18211a;
  font-size: 10px;
  font-weight: 800;
}
.promo-cta img {
  width: 11px;
  height: 11px;
}
.hot-scroll {
  width: 100%;
  overflow-x: auto;
  margin-top: 12px;
}
.hot-list {
  display: flex;
  gap: 9px;
  padding: 0 16px;
  width: max-content;
}
.hot-card {
  position: relative;
  width: 148px;
  height: 165px;
  padding: 0;
  border: 0;
  border-radius: 15px;
  overflow: hidden;
  background: #1f2a20;
  flex: 0 0 auto;
  text-align: left;
  cursor: pointer;
}
.hot-card > img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.35s ease;
}
.hot-card:hover > img {
  transform: scale(1.04);
}
.hot-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(10, 16, 12, 0) 36%, rgba(10, 16, 12, 0.87) 100%);
}
.hot-index {
  position: absolute;
  left: 10px;
  top: 8px;
  color: var(--lime);
  font-family: "Arial Black", sans-serif;
  font-size: 25px;
  font-weight: 900;
  line-height: 1;
  text-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);
}
.hot-rating {
  position: absolute;
  right: 8px;
  top: 9px;
  height: 19px;
  padding: 0 6px;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.93);
  display: flex;
  align-items: center;
  color: #18211a;
  font-size: 9px;
  font-weight: 800;
}
.hot-bottom {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.hot-bottom strong {
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hot-bottom span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, 0.7);
  font-size: 8.5px;
}
.hot-bottom b {
  color: var(--lime);
  font-weight: 700;
}
.feed-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 0 16px;
  margin: 24px 0 12px;
}
.feed-head h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.7px;
}
.feed-filter {
  height: 25px;
  padding: 0 8px;
  border-radius: 13px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 4px;
  color: #677066;
  font-size: 10px;
  box-shadow: 0 3px 8px rgba(24, 33, 26, 0.04);
}
.feed-filter img {
  width: 10px;
  height: 10px;
}
.feed-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 0 16px;
}
.feed-end {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 22px 16px 8px;
}
.feed-end span {
  width: 27px;
  height: 1px;
  background: #dcd9d0;
}
.feed-end small {
  color: #b0b5ad;
  font-size: 8px;
  letter-spacing: 1px;
}
</style>
