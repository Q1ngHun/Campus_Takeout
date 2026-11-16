<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import TabBar from './components/TabBar.vue'
import { cartCount, cartShop, cartTotal, state } from './store'

const route = useRoute()
const router = useRouter()
const screen = ref(null)
const isTab = computed(() => Boolean(route.meta.tab))

watch(
  () => route.fullPath,
  () => {
    if (screen.value) screen.value.scrollTop = 0
  }
)

function goCart() {
  if (!cartCount.value) return
  router.push('/cart')
}
</script>

<template>
  <div class="showcase">
    <aside class="brand-panel">
      <div class="brand-top">
        <div class="brand-mark">宿</div>
        <div class="brand-name-block">
          <span class="brand-name">校园宿达</span>
          <span class="brand-en">SUDA CAMPUS</span>
        </div>
      </div>

      <div class="brand-copy">
        <span class="brand-eyebrow">CAMPUS DELIVERY · 2026</span>
        <h1>把好吃的，<br /><em>送到宿舍楼下。</em></h1>
        <p>从食堂档口到深夜烧烤，15 分钟校园直送。为认真吃饭的你，做一份不将就的外卖。</p>
      </div>

      <div class="brand-features">
        <div class="feature-chip">
          <strong>15<span>min</span></strong>
          <span>平均送达</span>
        </div>
        <div class="feature-chip">
          <strong>2,600<span>+</span></strong>
          <span>同学在线点单</span>
        </div>
        <div class="feature-chip">
          <strong>4.9<span>★</span></strong>
          <span>校园好味评分</span>
        </div>
      </div>

      <div class="brand-footer">
        <div class="qr-card" aria-hidden="true">
          <div class="qr-grid">
            <span v-for="n in 49" :key="n" :class="{ filled: [1,2,4,6,8,10,11,12,15,17,19,22,23,24,27,29,31,33,34,35,38,40,42,45,47,48,49].includes(n) }"></span>
          </div>
          <div class="qr-copy">
            <span>MINI PROGRAM</span>
            <strong>扫码点一份好味</strong>
          </div>
        </div>
        <div class="brand-signature">
          <span>DESIGNED FOR CAMPUS LIFE</span>
          <span>HANGZHOU · CHINA</span>
        </div>
      </div>
    </aside>

    <main class="stage">
      <div class="stage-label">
        <span class="stage-live"></span>
        <span>LIVE PROTOTYPE</span>
        <span class="stage-line"></span>
        <span>390 × 844</span>
      </div>

      <div class="phone-shell">
        <div class="phone-statusbar">
          <span class="phone-time">9:41</span>
          <div class="phone-notch"></div>
          <div class="phone-system">
            <span class="signal"><i></i><i></i><i></i><i></i></span>
            <span class="wifi">◒</span>
            <span class="battery"><i></i></span>
          </div>
        </div>

        <div ref="screen" class="phone-screen">
          <router-view v-slot="{ Component }">
            <transition name="page" mode="out-in">
              <component :is="Component" />
            </transition>
          </router-view>
        </div>

        <TabBar v-if="isTab" />

        <div
          v-if="isTab && cartCount && cartShop"
          class="global-cart"
          @click="goCart"
        >
          <div class="global-cart-left">
            <div class="global-cart-icon">
              <img src="/icons/bag.svg" alt="" />
              <span>{{ cartCount }}</span>
            </div>
            <div class="global-cart-copy">
              <strong>¥{{ cartTotal.toFixed(2) }}</strong>
              <small>{{ cartShop.name }}</small>
            </div>
          </div>
          <div class="global-cart-action">
            <span>去结算</span>
            <img src="/icons/arrow.svg" alt="" />
          </div>
        </div>

        <div class="phone-home-indicator"></div>

        <transition name="toast">
          <div v-if="state.toast.visible" class="toast">
            <span class="toast-dot"></span>
            {{ state.toast.message }}
          </div>
        </transition>
      </div>

      <div class="stage-caption">
        <span>校园宿达 · 用户端交互原型</span>
        <span>SPRING BOOT + VUE 3 + MINI PROGRAM</span>
      </div>
    </main>
  </div>
</template>
