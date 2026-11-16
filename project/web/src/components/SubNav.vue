<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '' }
})
const router = useRouter()

function back() {
  if (window.history.length > 1) {
    router.back()
  } else {
    router.push('/')
  }
}
</script>

<template>
  <header class="sub-nav">
    <button class="sub-back" aria-label="返回" @click="back">
      <img src="/icons/chevron-left.svg" alt="" />
    </button>
    <span class="sub-title">{{ title }}</span>
    <div class="sub-action">
      <slot name="action"></slot>
    </div>
  </header>
</template>

<style scoped>
.sub-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 52px;
  padding: 0 18px;
  flex: 0 0 auto;
}
.sub-back {
  width: 34px;
  height: 34px;
  margin-left: -8px;
  border: 0;
  border-radius: 50%;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}
.sub-back img {
  width: 20px;
  height: 20px;
}
.sub-title {
  font-size: 15px;
  font-weight: 700;
  color: #18211a;
}
.sub-action {
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
