<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import MerchantCard from '../components/MerchantCard.vue'
import {
  addToCart,
  clearSearchHistory,
  hotSearches,
  merchants,
  saveSearchHistory,
  state,
  toast
} from '../store'

const router = useRouter()
const keyword = ref('')
const searched = ref(false)

const matchedMerchants = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  return merchants.filter((shop) => {
    return [shop.name, shop.en, shop.tags.join(' '), shop.hot.join(' '), shop.address].join(' ').toLowerCase().includes(query)
  })
})

const matchedDishes = computed(() => {
  const query = keyword.value.trim().toLowerCase()
  if (!query) return []
  const list = []
  merchants.forEach((shop) => {
    shop.dishes.forEach((dish) => {
      if (`${dish.name}${dish.desc}`.toLowerCase().includes(query)) {
        list.push({ ...dish, shopId: shop.id, shopName: shop.name, shop })
      }
    })
  })
  return list.slice(0, 4)
})

const resultCount = computed(() => matchedMerchants.value.length + matchedDishes.value.length)

function useKeyword(value) {
  keyword.value = value
  searched.value = true
  saveSearchHistory(value)
}

function onEnter() {
  if (!keyword.value.trim()) return
  searched.value = true
  saveSearchHistory(keyword.value.trim())
}

function clearInput() {
  keyword.value = ''
  searched.value = false
}

function goBack() {
  if (window.history.length > 1) router.back()
  else router.push('/')
}

function quickAdd(shop) {
  addToCart(shop.dishes[0], shop)
}

function addDish(dish) {
  addToCart(dish, dish.shop)
}

function surprise() {
  const shop = merchants[Math.floor(Math.random() * merchants.length)]
  toast(`今天吃 ${shop.name}`)
  setTimeout(() => router.push(`/shop/${shop.id}`), 450)
}

function removeHistory() {
  clearSearchHistory()
  toast('搜索历史已清空')
}
</script>

<template>
  <main class="sub-page search-page">
    <header class="search-nav">
      <button class="back" @click="goBack"><img src="/icons/chevron-left.svg" alt="" /></button>
      <div class="search-box">
        <img src="/icons/search.svg" alt="" />
        <input
          v-model="keyword"
          placeholder="搜店铺、美食或口味"
          @keyup.enter="onEnter"
          @focus="searched = false"
        />
        <button v-if="keyword" @click="clearInput"><img src="/icons/close.svg" alt="" /></button>
      </div>
      <button class="cancel" @click="goBack">取消</button>
    </header>

    <template v-if="!keyword">
      <section v-if="state.searchHistory.length" class="search-section">
        <div class="block-head">
          <div><strong>最近搜索</strong><small>RECENT</small></div>
          <button @click="removeHistory"><img src="/icons/trash.svg" alt="" /></button>
        </div>
        <div class="history-tags">
          <button v-for="item in state.searchHistory" :key="item" @click="useKeyword(item)">
            {{ item }} <img src="/icons/arrow.svg" alt="" />
          </button>
        </div>
      </section>

      <section class="search-section">
        <div class="block-head">
          <div><strong>校园热搜</strong><small>TRENDING NOW</small></div>
          <span class="live"><i></i>实时</span>
        </div>
        <div class="hot-searches">
          <button v-for="(item, index) in hotSearches" :key="item.name" @click="useKeyword(item.name)">
            <span class="rank" :class="{ top: index < 3 }">0{{ index + 1 }}</span>
            <strong>{{ item.name }}</strong>
            <small>{{ item.hot }}</small>
          </button>
        </div>
      </section>

      <button class="inspiration" @click="surprise">
        <img src="/images/hero-bowl.jpg" alt="" />
        <span class="mask"></span>
        <span class="copy">
          <small>CAN'T DECIDE?</small>
          <strong>不知道吃什么？</strong>
          <em>让宿达替你挑一家</em>
        </span>
        <span class="surprise-btn"><img src="/icons/spark.svg" alt="" />随机一家</span>
      </button>

      <p class="search-tip">搜索即代表同意《校园宿达搜索服务说明》</p>
    </template>

    <template v-else>
      <div class="results-head">
        <div>
          <h1>搜索结果</h1>
          <p>找到 {{ resultCount }} 个相关结果</p>
        </div>
        <span>综合 <img src="/icons/chevron-down.svg" alt="" /></span>
      </div>

      <div v-if="matchedMerchants.length" class="results-list">
        <MerchantCard v-for="shop in matchedMerchants" :key="shop.id" :merchant="shop" @add="quickAdd" />
      </div>

      <section v-if="matchedDishes.length" class="dish-section">
        <div class="dish-head"><strong>相关单品</strong><small>DISHES</small></div>
        <div class="dish-grid">
          <article v-for="dish in matchedDishes" :key="dish.id" class="dish-card">
            <img :src="dish.image" alt="" />
            <div>
              <strong>{{ dish.name }}</strong>
              <small>{{ dish.shopName }}</small>
              <span>¥{{ dish.price }} <button @click="addDish(dish)"><img src="/icons/plus.svg" alt="" /></button></span>
            </div>
          </article>
        </div>
      </section>

      <div v-if="!resultCount" class="no-result">
        <div><img src="/icons/search.svg" alt="" /><b>✦</b></div>
        <h3>没有找到这口好味</h3>
        <p>换个关键词试试，比如「拌饭」「鲜果茶」「夜宵」</p>
        <button @click="surprise">随机吃一家</button>
      </div>
    </template>
  </main>
</template>

<style scoped>
.search-page {
  background:
    radial-gradient(circle at 85% 0%, rgba(215, 255, 94, 0.18), transparent 28%),
    #f4f2ec;
  padding-bottom: 22px;
}
.search-nav {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 12px 13px 0 7px;
}
.back {
  width: 30px;
  height: 30px;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.back img {
  width: 19px;
  height: 19px;
}
.search-box {
  flex: 1;
  height: 40px;
  padding: 0 6px 0 12px;
  border-radius: 20px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
  box-shadow: 0 5px 13px rgba(24, 33, 26, 0.06);
}
.search-box > img {
  width: 15px;
  height: 15px;
}
.search-box input {
  flex: 1;
  min-width: 0;
  height: 40px;
  border: 0;
  outline: none;
  background: transparent;
  font-size: 12px;
}
.search-box input::placeholder {
  color: #a8aea5;
}
.search-box button {
  width: 22px;
  height: 22px;
  border: 0;
  border-radius: 50%;
  background: #eceae3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.search-box button img {
  width: 10px;
  height: 10px;
}
.cancel {
  flex: 0 0 auto;
  padding: 0 3px;
  border: 0;
  background: transparent;
  color: #586258;
  font-size: 12px;
  font-weight: 600;
}
.search-section {
  padding: 23px 16px 0;
}
.block-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
}
.block-head > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.block-head strong {
  font-size: 17px;
  font-weight: 800;
  letter-spacing: -0.4px;
}
.block-head small {
  color: #a4aaa1;
  font-size: 7px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.block-head > button {
  width: 27px;
  height: 27px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}
.block-head > button img {
  width: 13px;
  height: 13px;
  opacity: 0.55;
}
.history-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 12px;
}
.history-tags button {
  height: 33px;
  padding: 0 9px 0 12px;
  border: 0;
  border-radius: 17px;
  background: #fff;
  color: #505a50;
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 11px;
  box-shadow: 0 3px 9px rgba(24, 33, 26, 0.035);
}
.history-tags img {
  width: 10px;
  height: 10px;
  opacity: 0.35;
}
.live {
  display: flex;
  align-items: center;
  gap: 3px;
  color: #6f7d61;
  font-size: 8.5px;
}
.live i {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: var(--lime-deep);
}
.hot-searches {
  display: flex;
  flex-wrap: wrap;
  margin-top: 10px;
  padding: 6px 0;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 5px 16px rgba(24, 33, 26, 0.04);
}
.hot-searches button {
  width: 50%;
  height: 47px;
  padding: 0 11px;
  border: 0;
  border-bottom: 1px solid #f1efe9;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 6px;
  text-align: left;
}
.hot-searches button:nth-last-child(-n + 2) {
  border-bottom: 0;
}
.rank {
  width: 18px;
  font-family: "Arial Black", sans-serif;
  font-size: 13px;
  font-weight: 900;
  color: #c3c7bf;
}
.rank.top {
  color: #18211a;
}
.hot-searches strong {
  flex: 1;
  min-width: 0;
  font-size: 11.5px;
  font-weight: 600;
  color: #3d473e;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.hot-searches small {
  color: #b0b5ad;
  font-size: 8px;
}
.inspiration {
  position: relative;
  width: calc(100% - 32px);
  height: 126px;
  margin: 20px 16px 0;
  padding: 0;
  border: 0;
  border-radius: 17px;
  background: #14251b;
  overflow: hidden;
  text-align: left;
}
.inspiration > img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.mask {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, rgba(16, 25, 18, 0.92), rgba(16, 25, 18, 0.55) 62%, rgba(16, 25, 18, 0.2));
}
.inspiration .copy {
  position: absolute;
  left: 14px;
  top: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.inspiration .copy small {
  color: var(--lime);
  font-size: 7.5px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.inspiration .copy strong {
  color: #fff;
  font-size: 19px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.inspiration .copy em {
  color: #9eaa9b;
  font-size: 10px;
  font-style: normal;
}
.surprise-btn {
  position: absolute;
  right: 12px;
  bottom: 12px;
  height: 32px;
  padding: 0 10px;
  border-radius: 16px;
  background: var(--lime);
  color: #18211a;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10.5px;
  font-weight: 800;
}
.surprise-btn img {
  width: 12px;
  height: 12px;
}
.search-tip {
  padding: 25px 0 0;
  text-align: center;
  color: #b3b8b0;
  font-size: 8px;
}
.results-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 21px 17px 12px;
}
.results-head h1 {
  margin: 0;
  font-size: 19px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.results-head p {
  margin: 3px 0 0;
  color: #8f978e;
  font-size: 9.5px;
}
.results-head > span {
  height: 25px;
  padding: 0 8px;
  border-radius: 13px;
  background: #fff;
  display: flex;
  align-items: center;
  gap: 3px;
  color: #626c62;
  font-size: 10px;
}
.results-head > span img {
  width: 10px;
  height: 10px;
}
.results-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 0 16px;
}
.dish-section {
  padding: 16px 16px 0;
}
.dish-head {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 9px;
}
.dish-head strong {
  font-size: 16px;
  font-weight: 800;
}
.dish-head small {
  color: #a6aca3;
  font-size: 7px;
  letter-spacing: 1px;
  font-weight: 700;
}
.dish-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 9px;
}
.dish-card {
  width: calc(50% - 4.5px);
  padding: 6px;
  border-radius: 13px;
  background: #fff;
  box-shadow: 0 4px 13px rgba(24, 33, 26, 0.04);
}
.dish-card > img {
  width: 100%;
  height: 90px;
  border-radius: 9px;
  object-fit: cover;
}
.dish-card > div {
  padding: 6px 2px 1px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.dish-card strong {
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dish-card small {
  color: #9ba198;
  font-size: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.dish-card span {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 5px;
  font-size: 13px;
  font-weight: 900;
}
.dish-card span button {
  width: 23px;
  height: 23px;
  border: 0;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.dish-card span button img {
  width: 11px;
  height: 11px;
}
.no-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 50px 30px 10px;
  text-align: center;
}
.no-result > div {
  position: relative;
  width: 108px;
  height: 108px;
  border-radius: 50%;
  background: #e9eedb;
  display: flex;
  align-items: center;
  justify-content: center;
}
.no-result img {
  width: 42px;
  height: 42px;
  opacity: 0.65;
}
.no-result b {
  position: absolute;
  right: 3px;
  top: 4px;
  color: var(--lime-deep);
  font-size: 25px;
}
.no-result h3 {
  margin: 15px 0 0;
  font-size: 18px;
  font-weight: 800;
}
.no-result p {
  margin: 6px 0 0;
  color: #8a9189;
  font-size: 11px;
}
.no-result > button {
  height: 38px;
  margin-top: 17px;
  padding: 0 20px;
  border: 0;
  border-radius: 19px;
  background: #18211a;
  color: var(--lime);
  font-size: 11.5px;
  font-weight: 700;
}
</style>
