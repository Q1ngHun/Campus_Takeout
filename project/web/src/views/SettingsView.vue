<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import { toast } from '../store'

const router = useRouter()
const notify = ref(true)
const sound = ref(true)
const personalized = ref(false)
const location = ref(true)
const cacheSize = ref('12.6 MB')

function clearCache() {
  cacheSize.value = '0.0 MB'
  toast('搜索记录与临时缓存已清除')
}
</script>

<template>
  <main class="sub-page settings-page">
    <SubNav title="设置" />

    <section class="settings-head">
      <span class="eyebrow">PREFERENCES</span>
      <h1 class="page-display">设置<span class="dot">.</span></h1>
      <p>把宿达，调成你喜欢的样子</p>
    </section>

    <div class="profile-strip">
      <span class="avatar">满</span>
      <span><strong>林小满</strong><small>青禾大学 · 已认证</small></span>
      <b>SUDA PRO</b>
    </div>

    <section class="group">
      <span class="group-label">消息与通知</span>
      <div class="group-card">
        <div class="setting-row">
          <span class="icon lime"><img src="/icons/bell.svg" alt="" /></span>
          <span class="copy"><strong>订单通知</strong><small>骑手接单、送达提醒</small></span>
          <button class="switch" :class="{ on: notify }" @click="notify = !notify"><i></i></button>
        </div>
        <div class="line"></div>
        <div class="setting-row">
          <span class="icon peach"><img src="/icons/message.svg" alt="" /></span>
          <span class="copy"><strong>声音与振动</strong><small>新消息提示音</small></span>
          <button class="switch" :class="{ on: sound }" @click="sound = !sound"><i></i></button>
        </div>
        <div class="line"></div>
        <div class="setting-row">
          <span class="icon mint"><img src="/icons/leaf.svg" alt="" /></span>
          <span class="copy"><strong>个性化推荐</strong><small>根据口味推荐店铺</small></span>
          <button class="switch" :class="{ on: personalized }" @click="personalized = !personalized"><i></i></button>
        </div>
      </div>
    </section>

    <section class="group">
      <span class="group-label">隐私与通用</span>
      <div class="group-card">
        <div class="setting-row">
          <span class="icon lime"><img src="/icons/pin.svg" alt="" /></span>
          <span class="copy"><strong>位置权限</strong><small>用于推荐附近的校园好味</small></span>
          <button class="switch" :class="{ on: location }" @click="location = !location"><i></i></button>
        </div>
        <div class="line"></div>
        <button class="setting-row" @click="clearCache">
          <span class="icon sand"><img src="/icons/trash.svg" alt="" /></span>
          <span class="copy"><strong>清除缓存</strong><small>搜索记录与临时文件</small></span>
          <span class="value">{{ cacheSize }}</span>
          <img class="arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
        <div class="line"></div>
        <button class="setting-row" @click="toast('所有数据均保存在本地浏览器')">
          <span class="icon rose"><img src="/icons/shield.svg" alt="" /></span>
          <span class="copy"><strong>服务协议与隐私</strong><small>我们如何保护你的数据</small></span>
          <img class="arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
      </div>
    </section>

    <section class="group">
      <span class="group-label">关于</span>
      <div class="group-card">
        <button class="setting-row" @click="toast('宿达客服 400-0712-326 · 08:00-24:00')">
          <span class="icon mint"><img src="/icons/headset.svg" alt="" /></span>
          <span class="copy"><strong>联系客服</strong><small>每天 08:00 - 24:00 在线</small></span>
          <img class="arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
        <div class="line"></div>
        <button class="setting-row" @click="toast('校园宿达 1.0.0 · 把好吃的送到宿舍楼下')">
          <span class="icon lime"><img src="/icons/spark.svg" alt="" /></span>
          <span class="copy"><strong>关于校园宿达</strong><small>SUDA CAMPUS</small></span>
          <span class="value">1.0.0</span>
          <img class="arrow" src="/icons/chevron-right.svg" alt="" />
        </button>
      </div>
    </section>

    <button class="logout" @click="toast('已退出登录，本地数据仍会保留')">退出登录</button>

    <div class="settings-foot">
      <span class="logo">宿</span>
      <span>校园宿达 · 把好吃的送到楼下</span>
      <span>MADE FOR CAMPUS · 2026</span>
    </div>
  </main>
</template>

<style scoped>
.settings-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.16), transparent 30%),
    #f4f2ec;
  padding-bottom: 22px;
}
.settings-head {
  padding: 8px 17px 0;
}
.settings-head p {
  margin: 6px 0 0;
  color: #899187;
  font-size: 10.5px;
}
.profile-strip {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 14px 16px 0;
  padding: 9px;
  border-radius: 14px;
  background: #14251b;
  box-shadow: 0 8px 18px rgba(20, 37, 27, 0.12);
}
.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 15px;
  font-weight: 900;
}
.profile-strip > span:nth-child(2) {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.profile-strip strong {
  color: #fff;
  font-size: 12px;
  font-weight: 800;
}
.profile-strip small {
  color: #8c9b89;
  font-size: 8px;
}
.profile-strip b {
  padding: 3px 5px;
  border-radius: 4px;
  background: rgba(215, 255, 94, 0.12);
  color: var(--lime);
  font-size: 6.5px;
  letter-spacing: 0.5px;
}
.group {
  padding: 17px 16px 0;
}
.group-label {
  display: block;
  padding-left: 3px;
  margin-bottom: 7px;
  color: #9aa096;
  font-size: 9px;
  font-weight: 600;
}
.group-card {
  padding: 0 11px;
  border-radius: 15px;
  background: #fff;
  box-shadow: 0 5px 15px rgba(24, 33, 26, 0.04);
}
.setting-row {
  width: 100%;
  min-height: 54px;
  padding: 0;
  border: 0;
  background: transparent;
  display: flex;
  align-items: center;
  gap: 7px;
  text-align: left;
}
.icon {
  width: 29px;
  height: 29px;
  border-radius: 9px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
.icon img {
  width: 14px;
  height: 14px;
}
.lime { background: #eef6d9; }
.peach { background: #ffede5; }
.mint { background: #e2f0e9; }
.sand { background: #f3ecdf; }
.rose { background: #f7e6e9; }
.copy {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.copy strong {
  font-size: 11.5px;
  font-weight: 600;
  color: #303a30;
}
.copy small {
  color: #a0a69d;
  font-size: 8px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.value {
  color: #a0a69d;
  font-size: 9.5px;
}
.arrow {
  width: 11px;
  height: 11px;
  opacity: 0.35;
}
.line {
  height: 1px;
  margin-left: 36px;
  background: #f0eee8;
}
.switch {
  position: relative;
  width: 33px;
  height: 19px;
  padding: 0;
  border: 0;
  border-radius: 10px;
  background: #d8d6ce;
  transition: background 0.2s ease;
}
.switch.on {
  background: var(--lime-deep);
}
.switch i {
  position: absolute;
  left: 2px;
  top: 2px;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  transition: transform 0.2s ease;
}
.switch.on i {
  transform: translateX(14px);
}
.logout {
  width: calc(100% - 32px);
  height: 46px;
  margin: 18px 16px 0;
  border: 0;
  border-radius: 23px;
  background: #fff;
  color: #c16a56;
  font-size: 12px;
  font-weight: 700;
  box-shadow: 0 5px 15px rgba(24, 33, 26, 0.035);
}
.settings-foot {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 23px 0 4px;
  color: #b0b5ad;
  font-size: 8px;
}
.logo {
  width: 28px;
  height: 28px;
  margin-bottom: 2px;
  border-radius: 9px;
  background: #e4e8da;
  color: #8a9385;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: 900;
}
</style>
