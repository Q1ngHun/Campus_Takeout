<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const tabs = [
  { path: '/', label: '首页', icon: 'home', key: 'home' },
  { path: '/orders', label: '订单', icon: 'order', key: 'orders' },
  { path: '/profile', label: '我的', icon: 'user', key: 'profile' }
]

const active = computed(() => route.meta.tab || 'home')
</script>

<template>
  <nav class="tabbar">
    <RouterLink
      v-for="tab in tabs"
      :key="tab.key"
      :to="tab.path"
      class="tab-item"
      :class="{ active: active === tab.key }"
    >
      <span class="tab-icon">
        <img :src="`/icons/${tab.icon}.svg`" alt="" />
      </span>
      <span class="tab-label">{{ tab.label }}</span>
    </RouterLink>
  </nav>
</template>
