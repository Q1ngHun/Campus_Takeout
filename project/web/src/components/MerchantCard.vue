<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  merchant: { type: Object, required: true }
})
const emit = defineEmits(['add'])
const router = useRouter()

function open() {
  router.push(`/shop/${props.merchant.id}`)
}

function add(event) {
  event.stopPropagation()
  emit('add', props.merchant)
}
</script>

<template>
  <article class="merchant-card" @click="open">
    <div class="merchant-cover">
      <img :src="merchant.cover" :alt="merchant.name" />
      <div v-if="merchant.badge" class="merchant-badge">{{ merchant.badge }}</div>
      <div class="merchant-time">
        <img src="/icons/clock.svg" alt="" />
        {{ merchant.time }} min
      </div>
    </div>

    <div class="merchant-info">
      <div class="merchant-top">
        <h3>{{ merchant.name }}</h3>
        <span class="merchant-rating"><b>★</b>{{ merchant.rating }}</span>
      </div>
      <div class="merchant-meta">
        <span>{{ merchant.sales }}</span><i></i><span>{{ merchant.distance }}</span><i></i><span>配送 ¥{{ merchant.delivery }}</span>
      </div>
      <div class="merchant-tags">
        <span v-for="tag in merchant.tags" :key="tag">{{ tag }}</span>
      </div>
      <div class="merchant-bottom">
        <span class="merchant-coupon"><b>券</b>{{ merchant.coupon }}</span>
        <span class="merchant-dish">{{ merchant.hot[0] }}</span>
        <button class="merchant-add" aria-label="加入购物车" @click="add">
          <img src="/icons/plus.svg" alt="" />
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.merchant-card {
  display: flex;
  gap: 12px;
  padding: 10px;
  border-radius: 20px;
  background: #fff;
  box-shadow: 0 8px 26px rgba(24, 33, 26, 0.045);
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}
.merchant-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px rgba(24, 33, 26, 0.08);
}
.merchant-cover {
  position: relative;
  width: 118px;
  height: 126px;
  flex: 0 0 auto;
  border-radius: 14px;
  overflow: hidden;
  background: #ece9df;
}
.merchant-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.merchant-badge {
  position: absolute;
  left: 7px;
  top: 7px;
  padding: 3px 6px;
  border-radius: 4px;
  background: #d7ff5e;
  color: #18211a;
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.2px;
}
.merchant-time {
  position: absolute;
  left: 7px;
  bottom: 7px;
  height: 21px;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 0 7px;
  border-radius: 10px;
  background: rgba(20, 29, 22, 0.8);
  backdrop-filter: blur(6px);
  color: #f7ffe8;
  font-size: 9px;
  font-weight: 600;
}
.merchant-time img {
  width: 11px;
  height: 11px;
}
.merchant-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  padding: 4px 2px 2px 0;
}
.merchant-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 6px;
}
.merchant-top h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: -0.3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.merchant-rating {
  display: flex;
  align-items: center;
  gap: 2px;
  color: #18211a;
  font-size: 11px;
  font-weight: 800;
  flex: 0 0 auto;
}
.merchant-rating b {
  font-size: 9px;
}
.merchant-meta {
  display: flex;
  align-items: center;
  margin-top: 6px;
  color: #8a9189;
  font-size: 9px;
  white-space: nowrap;
}
.merchant-meta i {
  width: 2.5px;
  height: 2.5px;
  margin: 0 5px;
  border-radius: 50%;
  background: #c9ccc5;
}
.merchant-tags {
  display: flex;
  gap: 4px;
  margin-top: 7px;
  overflow: hidden;
}
.merchant-tags span {
  flex: 0 0 auto;
  padding: 2px 5px;
  border-radius: 4px;
  background: #f2f4ee;
  color: #687268;
  font-size: 8px;
}
.merchant-bottom {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: auto;
}
.merchant-coupon {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 3px;
  padding: 3px 5px;
  border-radius: 4px;
  background: #fff1ec;
  color: #f05a3b;
  font-size: 8px;
  font-weight: 700;
}
.merchant-coupon b {
  display: flex;
  width: 13px;
  height: 13px;
  align-items: center;
  justify-content: center;
  border-radius: 2px;
  background: #ff6b4a;
  color: #fff;
  font-size: 8px;
}
.merchant-dish {
  flex: 1;
  min-width: 0;
  color: #8a9189;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.merchant-add {
  width: 27px;
  height: 27px;
  flex: 0 0 auto;
  border: 0;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.18s ease;
}
.merchant-add:hover {
  transform: scale(1.06);
}
.merchant-add img {
  width: 13px;
  height: 13px;
}
</style>
