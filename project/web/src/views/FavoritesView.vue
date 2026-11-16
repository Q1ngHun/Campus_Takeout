<script setup>
import { useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import EmptyState from '../components/EmptyState.vue'
import MerchantCard from '../components/MerchantCard.vue'
import { addToCart, favoriteShops, toggleFavorite } from '../store'

const router = useRouter()

function quickAdd(shop) {
  addToCart(shop.dishes[0], shop)
}
</script>

<template>
  <main class="sub-page favorites-page">
    <SubNav title="我的收藏" />

    <section class="favorites-hero">
      <div class="copy">
        <span>SAVED TASTES</span>
        <h1>心头好<span>.</span></h1>
        <p>{{ favoriteShops.length }} 家店铺 · 想念的时候，随时点</p>
      </div>
      <div class="heart"><img src="/icons/heart.svg" alt="" /></div>
      <b>✦</b>
    </section>

    <div v-if="favoriteShops.length" class="favorites-head">
      <strong>收藏的店铺</strong>
      <small>{{ favoriteShops.length }} SAVED</small>
    </div>

    <div v-if="favoriteShops.length" class="favorites-list">
      <div v-for="shop in favoriteShops" :key="shop.id" class="favorite-wrap">
        <MerchantCard :merchant="shop" @add="quickAdd" />
        <button class="remove" @click="toggleFavorite(shop.id)">
          <img src="/icons/close.svg" alt="" />
        </button>
      </div>
    </div>

    <EmptyState
      v-else
      icon="heart"
      title="还没有收藏的店铺"
      desc="遇到喜欢的味道，点亮那颗小爱心吧"
      action="去发现好味"
      @action="router.push('/')"
    />

    <div v-if="favoriteShops.length" class="foot">
      <span></span>喜欢的，都留在这里<span></span>
    </div>
  </main>
</template>

<style scoped>
.favorites-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.16), transparent 30%),
    #f4f2ec;
  padding-bottom: 22px;
}
.favorites-hero {
  position: relative;
  height: 108px;
  margin: 7px 16px 0;
  padding: 15px;
  border-radius: 18px;
  background: var(--lime);
  overflow: hidden;
}
.copy {
  position: relative;
  z-index: 3;
}
.copy > span {
  color: #4b5a27;
  font-size: 7.5px;
  letter-spacing: 1.5px;
  font-weight: 800;
}
.copy h1 {
  margin: 6px 0 0;
  color: #18211a;
  font-size: 24px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
}
.copy h1 span {
  color: #18211a;
}
.copy p {
  margin: 7px 0 0;
  color: #55633c;
  font-size: 9px;
}
.heart {
  position: absolute;
  right: 20px;
  top: 15px;
  width: 62px;
  height: 62px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.34);
  display: flex;
  align-items: center;
  justify-content: center;
}
.heart img {
  width: 29px;
  height: 29px;
}
.favorites-hero > b {
  position: absolute;
  right: 84px;
  bottom: 12px;
  color: #5b6c2a;
  font-size: 18px;
}
.favorites-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 19px 17px 10px;
}
.favorites-head strong {
  font-size: 16.5px;
  font-weight: 800;
}
.favorites-head small {
  color: #a7ada4;
  font-size: 7.5px;
  letter-spacing: 1px;
  font-weight: 700;
}
.favorites-list {
  display: flex;
  flex-direction: column;
  gap: 11px;
  padding: 0 16px;
}
.favorite-wrap {
  position: relative;
}
.remove {
  position: absolute;
  z-index: 2;
  right: 24px;
  top: 8px;
  width: 20px;
  height: 20px;
  border: 0;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.92);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
}
.remove img {
  width: 9px;
  height: 9px;
}
.foot {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  padding: 22px 16px 8px;
  color: #b0b5ad;
  font-size: 8px;
}
.foot span {
  width: 25px;
  height: 1px;
  background: #dcd9d0;
}
</style>
