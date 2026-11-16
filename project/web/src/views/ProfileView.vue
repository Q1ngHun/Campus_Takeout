<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { coupons, favoriteShops, state, toast, user } from '../store'

const router = useRouter()
const availableCoupons = computed(() => coupons.filter((item) => item.status === 'available'))
const pointsLabel = computed(() => user.points.toLocaleString('en-US'))
const monthlyTotal = computed(() => user.monthly.reduce((sum, value) => sum + value, 0))
const maxMonthly = Math.max(...user.monthly)
const bars = computed(() => user.monthly.map((value, index) => ({
  value,
  height: Math.round((value / maxMonthly) * 68) + 9,
  day: user.monthlyDays[index],
  active: index === user.monthly.length - 1
})))

const services = [
  { name: '地址管理', icon: 'address', tone: 'lime', to: '/addresses' },
  { name: '优惠券', icon: 'coupon', tone: 'peach', to: '/coupons' },
  { name: '我的收藏', icon: 'heart', tone: 'rose', to: '/favorites' },
  { name: '联系客服', icon: 'headset', tone: 'mint', action: 'service' }
]

const menu = [
  { name: '我的评价', icon: 'star', desc: '3 条待评价', action: 'orders' },
  { name: '消息通知', icon: 'bell', desc: '2 条未读', action: 'notice' },
  { name: '口味偏好', icon: 'leaf', desc: '微辣 · 少糖', action: 'taste' },
  { name: '设置', icon: 'settings', desc: '', to: '/settings' }
]

function handleService(item) {
  if (item.to) return router.push(item.to)
  toast('宿达客服 400-0712-326 · 08:00-24:00')
}

function handleMenu(item) {
  if (item.to) return router.push(item.to)
  if (item.action === 'orders') return router.push('/orders')
  if (item.action === 'notice') return toast('订单正在配送中，预计 12:35 送达')
  if (item.action === 'taste') return toast('当前口味偏好：微辣 · 少糖')
}

function memberCenter() {
  toast('SUDA PRO · 本月已省 ¥19.8，再完成 3 单升级')
}

function showBalance() {
  toast(`宿达余额 ¥${user.balance.toFixed(2)} · 可用于全平台支付`)
}

function showPoints() {
  toast(`宿达积分 ${pointsLabel.value} · 100 积分兑 1 元红包`)
}
</script>

<template>
  <main class="app-page profile-page">
    <header class="profile-top">
      <div>
        <span class="eyebrow">MY SUDA</span>
        <h1 class="page-display">我的<span class="dot">.</span></h1>
      </div>
      <button class="settings-circle" @click="router.push('/settings')">
        <img src="/icons/settings.svg" alt="" />
      </button>
    </header>

    <section class="profile-hero">
      <span class="orbit orbit-one"></span>
      <span class="orbit orbit-two"></span>
      <span class="cross cross-one">+</span>
      <span class="cross cross-two">+</span>
      <button class="member-link" @click="memberCenter">
        <img src="/icons/spark.svg" alt="" />
        会员中心
        <img class="member-arrow" src="/icons/chevron-right.svg" alt="" />
      </button>
      <div class="profile-main">
        <div class="avatar-wrap">
          <span class="avatar-ring"></span>
          <div class="profile-avatar">{{ user.initial }}</div>
          <span class="verify-badge"><img src="/icons/check.svg" alt="" /></span>
        </div>
        <div class="profile-info">
          <div class="name-row">
            <h2>{{ user.name }}</h2>
            <span class="pro-pill">PRO</span>
          </div>
          <p>{{ user.school }}</p>
          <div class="profile-meta">
            {{ user.grade }}<i></i>校园身份已认证
          </div>
        </div>
      </div>
    </section>

    <div class="stats-card">
      <button @click="showBalance">
        <strong>¥{{ user.balance }}</strong>
        <span>宿达余额</span>
      </button>
      <i></i>
      <button @click="router.push('/coupons')">
        <strong>{{ availableCoupons.length }}<small>张</small></strong>
        <span>优惠券</span>
      </button>
      <i></i>
      <button @click="showPoints">
        <strong>{{ pointsLabel }}</strong>
        <span>宿达积分</span>
      </button>
    </div>

    <button class="pro-card" @click="memberCenter">
      <div class="pro-top">
        <div>
          <span class="pro-eyebrow"><img src="/icons/spark.svg" alt="" />SUDA PRO</span>
          <small>本月已为你省下</small>
        </div>
        <span class="pro-level">LV. 03</span>
      </div>
      <div class="pro-bottom">
        <strong><small>¥</small>{{ user.monthlySave }}</strong>
        <div class="pro-progress">
          <div><span>再完成 3 单升级黑耀会员</span><span>7 / 10</span></div>
          <i><span></span></i>
        </div>
      </div>
    </button>

    <div class="section-row profile-section">
      <div>
        <h2>我的服务</h2>
        <span class="section-en">SERVICES</span>
      </div>
      <button class="section-link">全部 <img src="/icons/arrow.svg" alt="" /></button>
    </div>

    <div class="service-grid">
      <button v-for="item in services" :key="item.name" @click="handleService(item)">
        <span class="service-icon" :class="`bg-${item.tone}`">
          <img :src="`/icons/${item.icon}.svg`" alt="" />
        </span>
        <span>{{ item.name }}</span>
      </button>
    </div>

    <section class="monthly-card">
      <div class="monthly-top">
        <div>
          <small>TASTE OF NOVEMBER</small>
          <div><strong>本月食光</strong><span>7 天</span></div>
        </div>
        <strong class="monthly-total"><small>¥</small>{{ monthlyTotal }}</strong>
      </div>
      <div class="chart">
        <div v-for="bar in bars" :key="bar.day" class="bar-col">
          <div class="bar-space">
            <span :class="{ active: bar.active }" :style="{ height: `${bar.height}px` }"></span>
          </div>
          <small :class="{ active: bar.active }">{{ bar.day }}</small>
        </div>
      </div>
      <div class="monthly-foot">
        <span>本周最常点：山野拌饭</span>
        <button @click="toast('本月食光报告生成中')">查看报告 <img src="/icons/arrow.svg" alt="" /></button>
      </div>
    </section>

    <div class="more-list">
      <button v-for="item in menu" :key="item.name" @click="handleMenu(item)">
        <span class="more-icon"><img :src="`/icons/${item.icon}.svg`" alt="" /></span>
        <span class="more-name">{{ item.name }}</span>
        <small>{{ item.desc }}</small>
        <img class="more-arrow" src="/icons/chevron-right.svg" alt="" />
      </button>
    </div>

    <div class="version">
      <span>SUDA CAMPUS · 校园宿达</span>
      <span>VERSION 1.0.0</span>
    </div>
  </main>
</template>

<style scoped>
.profile-page {
  background:
    radial-gradient(circle at 12% 0%, rgba(215, 255, 94, 0.2), transparent 25%),
    #f4f2ec;
  overflow: hidden;
}
.profile-top {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  padding: 20px 17px 0;
}
.settings-circle {
  width: 36px;
  height: 36px;
  margin-bottom: 2px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 5px 13px rgba(24, 33, 26, 0.06);
}
.settings-circle img {
  width: 18px;
  height: 18px;
}
.profile-hero {
  position: relative;
  margin: 14px 16px 0;
  padding: 18px 16px 48px;
  border-radius: 20px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 12px 24px rgba(20, 37, 27, 0.18);
}
.orbit {
  position: absolute;
  border: 1px solid rgba(215, 255, 94, 0.17);
  border-radius: 50%;
}
.orbit-one {
  width: 200px;
  height: 200px;
  right: -85px;
  top: -75px;
}
.orbit-two {
  width: 125px;
  height: 125px;
  right: -40px;
  top: -40px;
  border-color: rgba(215, 255, 94, 0.11);
}
.cross {
  position: absolute;
  color: rgba(215, 255, 94, 0.25);
  font-size: 14px;
  font-weight: 300;
}
.cross-one { right: 20px; top: 55px; }
.cross-two { left: 135px; bottom: 17px; }
.member-link {
  position: absolute;
  z-index: 3;
  right: 13px;
  top: 14px;
  height: 27px;
  padding: 0 7px 0 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.08);
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 9px;
  font-weight: 600;
}
.member-link img {
  width: 12px;
  height: 12px;
}
.member-link .member-arrow {
  width: 9px;
  height: 9px;
  filter: invert(1);
  opacity: 0.7;
}
.profile-main {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 19px;
}
.avatar-wrap {
  position: relative;
  width: 66px;
  height: 66px;
  flex: 0 0 auto;
}
.avatar-ring {
  position: absolute;
  inset: -5px;
  border: 1px dashed rgba(215, 255, 94, 0.4);
  border-radius: 50%;
}
.profile-avatar {
  position: absolute;
  inset: 0;
  border: 2px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  background: linear-gradient(145deg, #e7ff9d, #b9e83e);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #18211a;
  font-size: 27px;
  font-weight: 900;
  letter-spacing: -1px;
  box-shadow: 0 5px 14px rgba(0, 0, 0, 0.2);
}
.verify-badge {
  position: absolute;
  right: -1px;
  bottom: 2px;
  width: 19px;
  height: 19px;
  border: 1.5px solid #fff;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.verify-badge img {
  width: 10px;
  height: 10px;
}
.profile-info {
  flex: 1;
  min-width: 0;
  padding-right: 55px;
}
.name-row {
  display: flex;
  align-items: center;
  gap: 5px;
}
.name-row h2 {
  margin: 0;
  color: #fff;
  font-size: 21px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.pro-pill {
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: var(--lime);
  color: #18211a;
  font-size: 7.5px;
  font-weight: 900;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
}
.profile-info p {
  margin: 5px 0 0;
  color: #a5b1a1;
  font-size: 9.5px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.profile-meta {
  display: flex;
  align-items: center;
  margin-top: 5px;
  color: #71806f;
  font-size: 8.5px;
}
.profile-meta i {
  width: 2.5px;
  height: 2.5px;
  margin: 0 5px;
  border-radius: 50%;
  background: #5e6b5c;
}
.stats-card {
  position: relative;
  z-index: 3;
  height: 74px;
  margin: -29px 25px 0;
  padding: 0 5px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 8px 20px rgba(24, 33, 26, 0.1);
  display: flex;
  align-items: center;
}
.stats-card button {
  flex: 1;
  height: 100%;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
}
.stats-card strong {
  font-family: "Arial Black", sans-serif;
  font-size: 18px;
  font-weight: 900;
  letter-spacing: -0.5px;
}
.stats-card strong small {
  margin-left: 1px;
  color: #8c938a;
  font-family: inherit;
  font-size: 8px;
}
.stats-card button > span {
  color: #9aa096;
  font-size: 9px;
}
.stats-card > i {
  width: 1px;
  height: 24px;
  background: #eeece5;
}
.pro-card {
  width: calc(100% - 32px);
  margin: 12px 16px 0;
  padding: 13px 14px 12px;
  border: 0;
  border-radius: 16px;
  background: var(--lime);
  overflow: hidden;
  text-align: left;
}
.pro-top {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.pro-top > div {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pro-eyebrow {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #4a5a24;
  font-size: 8.5px;
  letter-spacing: 1px;
  font-weight: 800;
}
.pro-eyebrow img {
  width: 11px;
  height: 11px;
}
.pro-top small {
  color: #55633c;
  font-size: 10.5px;
}
.pro-level {
  padding: 3px 7px;
  border-radius: 9px;
  background: rgba(24, 33, 26, 0.9);
  color: var(--lime);
  font-size: 8px;
  font-weight: 800;
  letter-spacing: 0.5px;
}
.pro-bottom {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 2px;
}
.pro-bottom > strong {
  color: #18211a;
  font-family: "Arial Black", sans-serif;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -1.5px;
  line-height: 1;
}
.pro-bottom > strong small {
  margin-right: 2px;
  font-size: 11px;
}
.pro-progress {
  width: 145px;
  padding-bottom: 3px;
}
.pro-progress > div {
  display: flex;
  justify-content: space-between;
  color: #536232;
  font-size: 8px;
  font-weight: 600;
}
.pro-progress > i {
  display: block;
  height: 4.5px;
  margin-top: 5px;
  border-radius: 3px;
  background: rgba(24, 33, 26, 0.13);
  overflow: hidden;
}
.pro-progress > i span {
  display: block;
  width: 70%;
  height: 100%;
  border-radius: 3px;
  background: #18211a;
}
.profile-section {
  margin-top: 23px;
}
.service-grid {
  display: flex;
  margin: 12px 16px 0;
  padding: 13px 4px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(24, 33, 26, 0.04);
}
.service-grid button {
  width: 25%;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  color: #505a50;
  font-size: 10px;
  font-weight: 600;
}
.service-icon {
  width: 44px;
  height: 44px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.service-icon img {
  width: 20px;
  height: 20px;
}
.bg-lime { background: #e8f5cb; }
.bg-peach { background: #ffe4d8; }
.bg-rose { background: #f7e0e6; }
.bg-mint { background: #def0e7; }
.monthly-card {
  margin: 12px 16px 0;
  padding: 14px;
  border-radius: 17px;
  background: #14251b;
  box-shadow: 0 10px 22px rgba(20, 37, 27, 0.14);
}
.monthly-top {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
}
.monthly-top > div > small {
  color: #7f8f7c;
  font-size: 7.5px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.monthly-top > div > div {
  display: flex;
  align-items: center;
  gap: 5px;
  margin-top: 4px;
}
.monthly-top strong {
  color: #fff;
  font-size: 16px;
  font-weight: 800;
}
.monthly-top > div > div > span {
  height: 16px;
  padding: 0 5px;
  border-radius: 8px;
  background: rgba(215, 255, 94, 0.12);
  color: var(--lime);
  font-size: 7.5px;
  font-weight: 600;
  display: flex;
  align-items: center;
}
.monthly-total {
  color: var(--lime);
  font-family: "Arial Black", sans-serif;
  font-size: 25px;
  font-weight: 900;
  letter-spacing: -1px;
  line-height: 1;
}
.monthly-total small {
  font-size: 10px;
}
.chart {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 96px;
  margin-top: 13px;
  padding: 0 2px;
}
.bar-col {
  width: 29px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.bar-space {
  height: 78px;
  display: flex;
  align-items: flex-end;
}
.bar-space span {
  width: 11px;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.16);
  transition: height 0.35s ease;
}
.bar-space span.active {
  width: 15px;
  background: var(--lime);
  box-shadow: 0 0 12px rgba(215, 255, 94, 0.28);
}
.bar-col > small {
  color: #657362;
  font-size: 8px;
}
.bar-col > small.active {
  color: var(--lime);
  font-weight: 700;
}
.monthly-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 11px;
  padding-top: 10px;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}
.monthly-foot > span {
  color: #7f8f7c;
  font-size: 8.5px;
}
.monthly-foot button {
  padding: 0;
  border: 0;
  background: transparent;
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
  font-weight: 600;
}
.monthly-foot img {
  width: 10px;
  height: 10px;
  filter: invert(86%) sepia(71%) saturate(479%) hue-rotate(29deg) brightness(109%);
}
.more-list {
  margin: 12px 16px 0;
  padding: 0 12px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 7px 20px rgba(24, 33, 26, 0.04);
}
.more-list button {
  width: 100%;
  height: 54px;
  padding: 0;
  border: 0;
  border-bottom: 1px solid #f0eee8;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 8px;
  text-align: left;
}
.more-list button:last-child {
  border-bottom: 0;
}
.more-icon {
  width: 29px;
  height: 29px;
  border-radius: 9px;
  background: #f4f5ef;
  display: flex;
  align-items: center;
  justify-content: center;
}
.more-icon img {
  width: 15px;
  height: 15px;
}
.more-name {
  flex: 1;
  font-size: 12px;
  font-weight: 600;
  color: #353f35;
}
.more-list small {
  color: #a0a69d;
  font-size: 9px;
}
.more-arrow {
  width: 12px;
  height: 12px;
  opacity: 0.38;
}
.version {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 22px 0 4px;
  color: #b2b7af;
  font-size: 8px;
  letter-spacing: 1px;
}
</style>
