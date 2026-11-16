<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import EmptyState from '../components/EmptyState.vue'
import { coupons, selectCoupon, toast } from '../store'

const router = useRouter()
const activeTab = ref('available')

const tabs = computed(() => [
  { id: 'available', label: '可使用', count: coupons.filter((item) => item.status === 'available').length },
  { id: 'used', label: '已使用', count: coupons.filter((item) => item.status === 'used').length },
  { id: 'expired', label: '已过期', count: coupons.filter((item) => item.status === 'expired').length }
])
const visible = computed(() => coupons.filter((item) => item.status === activeTab.value))
const totalSave = computed(() => coupons.filter((item) => item.status === 'available').reduce((sum, item) => sum + item.amount, 0))

function use(coupon) {
  selectCoupon(coupon)
  toast('已放入本次订单')
  setTimeout(() => router.push('/'), 400)
}

function claimMore() {
  toast('领券中心 · 本周还有 2 张校园专享券')
}
</script>

<template>
  <main class="sub-page coupons-page">
    <SubNav title="优惠券" />

    <section class="coupons-hero">
      <div class="hero-top">
        <span>SUDA COUPONS</span>
        <button @click="claimMore">领券中心 <img src="/icons/arrow.svg" alt="" /></button>
      </div>
      <h1>这周，<br /><em>吃点好的。</em></h1>
      <div class="hero-saving">
        <span>可用优惠总额</span>
        <strong>¥{{ totalSave }}</strong>
      </div>
      <b class="spark">✦</b>
      <i class="orbit"></i>
    </section>

    <div class="coupon-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.id"
        :class="{ active: activeTab === tab.id }"
        @click="activeTab = tab.id"
      >
        {{ tab.label }}<span v-if="tab.count">{{ tab.count }}</span>
      </button>
    </div>

    <div v-if="visible.length" class="coupon-list">
      <article v-for="coupon in visible" :key="coupon.id" class="ticket" :class="`status-${coupon.status}`">
        <div class="ticket-left">
          <strong v-if="coupon.type === '满减'"><small>¥</small>{{ coupon.amount }}</strong>
          <strong v-else-if="coupon.type === '折扣'">{{ coupon.amount }}<small>折</small></strong>
          <strong v-else class="free">免配送</strong>
          <span>{{ coupon.threshold ? `满 ${coupon.threshold} 可用` : '无门槛' }}</span>
          <i class="notch top"></i><i class="notch bottom"></i>
        </div>
        <div class="ticket-right">
          <div class="ticket-head"><strong>{{ coupon.title }}</strong><span>{{ coupon.type }}</span></div>
          <p>{{ coupon.desc }}</p>
          <small>{{ coupon.scope }}</small>
          <div class="ticket-foot">
            <span>有效期至 {{ coupon.expire }}</span>
            <button v-if="coupon.status === 'available'" @click="use(coupon)">去使用</button>
            <span v-else>{{ coupon.status === 'used' ? '已使用' : '已过期' }}</span>
          </div>
        </div>
        <b v-if="coupon.status !== 'available'" class="stamp">{{ coupon.status === 'used' ? 'USED' : 'EXPIRED' }}</b>
      </article>
    </div>

    <EmptyState
      v-else
      icon="coupon"
      :title="activeTab === 'available' ? '暂时没有可用优惠券' : '这里还没有记录'"
      :desc="activeTab === 'available' ? '去领券中心看看，校园专享福利每周更新' : '每一张券，都替你省下过一顿好味'"
      :action="activeTab === 'available' ? '去领券' : ''"
      @action="claimMore"
    />

    <section class="rules">
      <div><strong>使用说明</strong><small>RULES</small></div>
      <p>· 优惠券仅限校园宿达平台使用，不可折现</p>
      <p>· 单笔订单限用一张，不与其他优惠叠加</p>
      <p>· 退款时优惠券按原规则退回</p>
    </section>
  </main>
</template>

<style scoped>
.coupons-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.16), transparent 30%),
    #f4f2ec;
  padding-bottom: 22px;
}
.coupons-hero {
  position: relative;
  height: 166px;
  margin: 7px 16px 0;
  padding: 15px;
  border-radius: 19px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(20, 37, 27, 0.18);
}
.hero-top {
  position: relative;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.hero-top > span {
  color: var(--lime);
  font-size: 7.5px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.hero-top button {
  height: 25px;
  padding: 0 7px 0 9px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
}
.hero-top button img {
  width: 10px;
  height: 10px;
}
.coupons-hero h1 {
  position: relative;
  z-index: 3;
  margin: 13px 0 0;
  color: #fff;
  font-size: 25px;
  font-weight: 900;
  line-height: 1.2;
  letter-spacing: -1.5px;
}
.coupons-hero h1 em {
  color: var(--lime);
  font-style: normal;
}
.hero-saving {
  position: absolute;
  z-index: 3;
  right: 16px;
  bottom: 14px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
}
.hero-saving span {
  color: #94a291;
  font-size: 8px;
}
.hero-saving strong {
  color: var(--lime);
  font-family: "Arial Black", sans-serif;
  font-size: 35px;
  font-weight: 900;
  letter-spacing: -2px;
  line-height: 1;
}
.spark {
  position: absolute;
  right: 100px;
  top: 53px;
  color: rgba(215, 255, 94, 0.35);
  font-size: 19px;
}
.orbit {
  position: absolute;
  right: -50px;
  top: -60px;
  width: 190px;
  height: 190px;
  border: 1px solid rgba(215, 255, 94, 0.14);
  border-radius: 50%;
}
.coupon-tabs {
  display: flex;
  margin: 14px 16px 0;
  padding: 3.5px;
  border-radius: 20px;
  background: #eae8e1;
}
.coupon-tabs button {
  flex: 1;
  height: 32px;
  border: 0;
  border-radius: 16px;
  background: transparent;
  color: #7d857d;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 3px;
  font-size: 11.5px;
}
.coupon-tabs button.active {
  background: #fff;
  color: #18211a;
  font-weight: 800;
  box-shadow: 0 3px 9px rgba(24, 33, 26, 0.08);
}
.coupon-tabs span {
  min-width: 13px;
  height: 13px;
  padding: 0 3px;
  border-radius: 7px;
  background: var(--lime);
  color: #18211a;
  font-size: 7.5px;
  font-weight: 800;
  display: flex;
  align-items: center;
  justify-content: center;
}
.coupon-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 14px 16px 0;
}
.ticket {
  position: relative;
  display: flex;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.05);
  overflow: hidden;
}
.ticket-left {
  position: relative;
  width: 106px;
  flex: 0 0 auto;
  padding: 13px 9px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
}
.ticket-left > strong {
  font-family: "Arial Black", sans-serif;
  font-size: 30px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
}
.ticket-left > strong small {
  font-size: 11px;
}
.ticket-left > strong.free {
  font-size: 18px;
  letter-spacing: -0.5px;
}
.ticket-left > span {
  color: #8ea188;
  font-size: 8px;
}
.ticket-left::after {
  content: "";
  position: absolute;
  right: 0;
  top: 12px;
  bottom: 12px;
  border-right: 1px dashed rgba(255, 255, 255, 0.14);
}
.notch {
  position: absolute;
  right: -6.5px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background: #f4f2ec;
  z-index: 2;
}
.notch.top { top: -6.5px; }
.notch.bottom { bottom: -6.5px; }
.ticket-right {
  flex: 1;
  min-width: 0;
  padding: 11px 11px 9px 13px;
  display: flex;
  flex-direction: column;
}
.ticket-head {
  display: flex;
  align-items: center;
  gap: 5px;
}
.ticket-head strong {
  font-size: 12.5px;
  font-weight: 800;
}
.ticket-head span {
  padding: 2px 4px;
  border-radius: 3px;
  background: #f3f4ee;
  color: #7c8578;
  font-size: 7px;
}
.ticket-right p {
  margin: 4px 0 0;
  color: #8e968d;
  font-size: 9px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ticket-right > small {
  margin-top: 2px;
  color: #adb2a9;
  font-size: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.ticket-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: auto;
  padding-top: 6px;
}
.ticket-foot > span {
  color: #b0b5ad;
  font-size: 7.5px;
}
.ticket-foot button {
  height: 23px;
  padding: 0 9px;
  border: 0;
  border-radius: 12px;
  background: var(--lime);
  color: #18211a;
  font-size: 9px;
  font-weight: 800;
}
.ticket.status-used,
.ticket.status-expired {
  opacity: 0.64;
}
.ticket.status-used .ticket-left,
.ticket.status-expired .ticket-left {
  background: #e6e3db;
  color: #8b9289;
}
.ticket.status-used .ticket-left > span,
.ticket.status-expired .ticket-left > span {
  color: #9ba198;
}
.stamp {
  position: absolute;
  right: 9px;
  bottom: 31px;
  padding: 2px 5px;
  border: 1px solid #c8cbc4;
  border-radius: 3px;
  color: #b4b8b1;
  font-size: 6.5px;
  font-weight: 800;
  letter-spacing: 0.5px;
  transform: rotate(-12deg);
}
.rules {
  margin: 15px 16px 0;
  padding: 12px;
  border-radius: 14px;
  background: #fff;
}
.rules > div {
  display: flex;
  align-items: baseline;
  gap: 5px;
  margin-bottom: 5px;
}
.rules strong {
  font-size: 12px;
  font-weight: 800;
}
.rules small {
  color: #a9afa6;
  font-size: 7px;
  letter-spacing: 1px;
  font-weight: 700;
}
.rules p {
  margin: 0;
  color: #9aa096;
  font-size: 8.5px;
  line-height: 2;
}
</style>
