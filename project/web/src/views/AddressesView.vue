<script setup>
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import SubNav from '../components/SubNav.vue'
import EmptyState from '../components/EmptyState.vue'
import { deleteAddress, saveAddress, selectAddress, state, toast } from '../store'

const route = useRoute()
const router = useRouter()
const sheetOpen = ref(false)
const editing = ref(null)
const draft = ref({ name: '', phone: '', label: '宿舍', detail: '', note: '' })

function choose(address) {
  selectAddress(address)
  if (route.query.select === '1') {
    toast('已选择收货地址')
    setTimeout(() => router.back(), 300)
  } else {
    toast('已设为默认地址')
  }
}

function openAdd() {
  editing.value = null
  draft.value = { name: '林小满', phone: '138 6621 0928', label: '宿舍', detail: '', note: '' }
  sheetOpen.value = true
}

function openEdit(address) {
  editing.value = address
  draft.value = { ...address }
  sheetOpen.value = true
}

function save() {
  if (!draft.value.name.trim()) return toast('请填写收货人')
  if (!draft.value.phone.trim()) return toast('请填写联系电话')
  if (!draft.value.detail.trim()) return toast('请填写详细地址')
  saveAddress({ ...draft.value })
  sheetOpen.value = false
  toast('地址已保存')
}

function remove(address) {
  deleteAddress(address.id)
  toast('地址已删除')
}
</script>

<template>
  <main class="sub-page addresses-page">
    <SubNav title="地址管理">
      <template #action>
        <button class="nav-add" @click="openAdd"><img src="/icons/plus.svg" alt="" /></button>
      </template>
    </SubNav>

    <section class="address-hero">
      <div class="hero-copy">
        <span>DELIVERY SPOT</span>
        <h1>把好味，<br />送到你手里。</h1>
        <p>{{ state.addresses.length }} 个常用地址 · 校园直送</p>
      </div>
      <div class="hero-route">
        <span class="orbit"></span>
        <span class="dash"></span>
        <span class="start"><i></i></span>
        <span class="end"><img src="/icons/pin.svg" alt="" /></span>
        <span class="scooter"><img src="/icons/scooter.svg" alt="" /></span>
      </div>
    </section>

    <div class="section-row address-head">
      <div><h2>我的地址</h2><span class="section-en">SAVED ADDRESSES</span></div>
      <button class="add-mini" @click="openAdd"><img src="/icons/plus.svg" alt="" />新增</button>
    </div>

    <div v-if="state.addresses.length" class="address-list">
      <article
        v-for="address in state.addresses"
        :key="address.id"
        class="address-card"
        :class="{ default: address.default }"
        @click="choose(address)"
      >
        <div class="address-top">
          <span class="type">{{ address.label }}</span>
          <span v-if="address.default" class="default-tag">默认</span>
          <span class="person"><strong>{{ address.name }}</strong><small>{{ address.phone }}</small></span>
        </div>
        <h3>{{ address.detail }}</h3>
        <p v-if="address.note">{{ address.note }}</p>
        <div class="address-foot">
          <div>
            <button @click.stop="openEdit(address)"><img src="/icons/edit.svg" alt="" />编辑</button>
            <button class="danger" @click.stop="remove(address)"><img src="/icons/trash.svg" alt="" />删除</button>
            <button v-if="!address.default" @click.stop="choose(address)"><img src="/icons/check.svg" alt="" />设为默认</button>
          </div>
          <span v-if="address.default" class="checked"><img src="/icons/check.svg" alt="" /></span>
        </div>
      </article>
    </div>

    <EmptyState
      v-else
      icon="address"
      title="还没有收货地址"
      desc="添加宿舍或教学楼地址，让好味准时抵达"
      action="新增地址"
      @action="openAdd"
    />

    <button class="add-address-bar" @click="openAdd">
      <span><img src="/icons/plus.svg" alt="" /></span>
      新增收货地址
      <img class="bar-arrow" src="/icons/arrow.svg" alt="" />
    </button>

    <transition name="fade">
      <div v-if="sheetOpen" class="sheet-mask" @click.self="sheetOpen = false">
        <div class="sheet address-sheet">
          <div class="sheet-handle"></div>
          <div class="sheet-head">
            <div><small>ADDRESS</small><strong>{{ editing ? '编辑地址' : '新增地址' }}</strong></div>
            <button @click="sheetOpen = false"><img src="/icons/close.svg" alt="" /></button>
          </div>
          <div class="label-row">
            <button
              v-for="label in ['宿舍', '教学楼', '其他']"
              :key="label"
              :class="{ active: draft.label === label }"
              @click="draft.label = label"
            >{{ label }}</button>
          </div>
          <div class="form-card">
            <label><span>收货人</span><input v-model="draft.name" placeholder="怎么称呼你" /></label>
            <i></i>
            <label><span>手机号</span><input v-model="draft.phone" placeholder="方便骑手联系你" /></label>
            <i></i>
            <label><span>详细地址</span><input v-model="draft.detail" placeholder="如：北苑 7 号楼 502 室" /></label>
            <i></i>
            <label><span>备注</span><input v-model="draft.note" placeholder="门禁、放置位置等" /></label>
          </div>
          <button class="save-btn" @click="save">保存地址 <img src="/icons/arrow.svg" alt="" /></button>
        </div>
      </div>
    </transition>
  </main>
</template>

<style scoped>
.addresses-page {
  background:
    radial-gradient(circle at 88% 0%, rgba(215, 255, 94, 0.16), transparent 30%),
    #f4f2ec;
  padding-bottom: 94px;
}
.nav-add {
  width: 32px;
  height: 32px;
  border: 0;
  border-radius: 50%;
  background: #18211a;
  display: flex;
  align-items: center;
  justify-content: center;
}
.nav-add img {
  width: 15px;
  height: 15px;
}
.address-hero {
  position: relative;
  height: 140px;
  margin: 7px 16px 0;
  padding: 16px;
  border-radius: 19px;
  background: #14251b;
  overflow: hidden;
  box-shadow: 0 10px 22px rgba(20, 37, 27, 0.16);
}
.hero-copy {
  position: relative;
  z-index: 3;
}
.hero-copy > span {
  color: var(--lime);
  font-size: 7.5px;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.hero-copy h1 {
  margin: 7px 0 0;
  color: #fff;
  font-size: 21px;
  font-weight: 900;
  line-height: 1.28;
  letter-spacing: -0.8px;
}
.hero-copy p {
  margin: 7px 0 0;
  color: #93a090;
  font-size: 9px;
}
.hero-route {
  position: absolute;
  right: 0;
  top: 0;
  width: 170px;
  height: 140px;
}
.orbit {
  position: absolute;
  right: -40px;
  top: -25px;
  width: 165px;
  height: 165px;
  border: 1px solid rgba(215, 255, 94, 0.17);
  border-radius: 50%;
}
.dash {
  position: absolute;
  right: 30px;
  top: 75px;
  width: 78px;
  height: 1px;
  background-image: linear-gradient(90deg, rgba(215, 255, 94, 0.6) 50%, transparent 50%);
  background-size: 5px 1px;
  transform: rotate(-16deg);
}
.start {
  position: absolute;
  left: 23px;
  top: 78px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #f4f2ec;
  display: flex;
  align-items: center;
  justify-content: center;
}
.start i {
  width: 4.5px;
  height: 4.5px;
  border-radius: 50%;
  background: #18211a;
}
.end {
  position: absolute;
  right: 15px;
  top: 38px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
}
.end img {
  width: 15px;
  height: 15px;
}
.scooter {
  position: absolute;
  right: 78px;
  top: 37px;
  width: 29px;
  height: 29px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
}
.scooter img {
  width: 16px;
  height: 16px;
  filter: invert(1);
}
.address-head {
  margin-top: 21px;
}
.add-mini {
  height: 28px;
  padding: 0 9px;
  border: 0;
  border-radius: 14px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: center;
  gap: 3px;
  font-size: 10px;
  font-weight: 700;
}
.add-mini img {
  width: 11px;
  height: 11px;
}
.address-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 12px 16px 0;
}
.address-card {
  padding: 12px;
  border: 1px solid transparent;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 6px 18px rgba(24, 33, 26, 0.045);
  cursor: pointer;
}
.address-card.default {
  border-color: var(--lime);
}
.address-top {
  display: flex;
  align-items: center;
  gap: 4px;
}
.type {
  height: 17px;
  padding: 0 6px;
  border-radius: 4px;
  background: #18211a;
  color: var(--lime);
  font-size: 8px;
  font-weight: 700;
  display: flex;
  align-items: center;
}
.default-tag {
  height: 17px;
  padding: 0 5px;
  border-radius: 4px;
  background: #eef7d5;
  color: #5b741c;
  font-size: 7.5px;
  display: flex;
  align-items: center;
}
.person {
  margin-left: auto;
  display: flex;
  align-items: baseline;
  gap: 5px;
}
.person strong {
  font-size: 13px;
  font-weight: 800;
}
.person small {
  color: #899187;
  font-size: 9.5px;
}
.address-card h3 {
  margin: 8px 0 0;
  color: #283228;
  font-size: 14px;
  font-weight: 800;
  line-height: 1.4;
}
.address-card p {
  margin: 3px 0 0;
  color: #a0a69d;
  font-size: 9px;
}
.address-foot {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 9px;
  padding-top: 8px;
  border-top: 1px solid #f0eee8;
}
.address-foot > div {
  display: flex;
  gap: 12px;
}
.address-foot button {
  padding: 0;
  border: 0;
  background: transparent;
  color: #8a9288;
  display: flex;
  align-items: center;
  gap: 2px;
  font-size: 9px;
}
.address-foot button img {
  width: 10px;
  height: 10px;
  opacity: 0.55;
}
.address-foot button.danger {
  color: #c77a68;
}
.checked {
  width: 21px;
  height: 21px;
  border-radius: 50%;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
}
.checked img {
  width: 10px;
  height: 10px;
}
.add-address-bar {
  position: fixed;
  z-index: 80;
  left: 16px;
  right: 16px;
  bottom: 16px;
  height: 52px;
  padding: 0 9px 0 7px;
  border: 0;
  border-radius: 26px;
  background: #18211a;
  box-shadow: 0 10px 24px rgba(24, 33, 26, 0.24);
  color: #fff;
  display: flex;
  align-items: center;
  gap: 7px;
  font-size: 12px;
  font-weight: 700;
}
.add-address-bar > span {
  width: 37px;
  height: 37px;
  border-radius: 50%;
  background: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
}
.add-address-bar > span img {
  width: 17px;
  height: 17px;
}
.add-address-bar > img.bar-arrow {
  width: 14px;
  height: 14px;
  margin-left: auto;
  margin-right: 7px;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.address-sheet {
  color: #18211a;
}
.sheet-head {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.sheet-head > div {
  display: flex;
  flex-direction: column;
  gap: 3px;
}
.sheet-head small {
  color: #9ba198;
  font-size: 7px;
  letter-spacing: 2px;
  font-weight: 700;
}
.sheet-head strong {
  font-size: 19px;
  font-weight: 900;
}
.sheet-head button {
  width: 30px;
  height: 30px;
  border: 0;
  border-radius: 50%;
  background: #eceae3;
  display: flex;
  align-items: center;
  justify-content: center;
}
.sheet-head button img {
  width: 14px;
  height: 14px;
}
.label-row {
  display: flex;
  gap: 6px;
  margin-top: 12px;
}
.label-row button {
  height: 29px;
  padding: 0 12px;
  border: 0;
  border-radius: 15px;
  background: #ecebe4;
  color: #6e776e;
  font-size: 10.5px;
}
.label-row button.active {
  background: #18211a;
  color: var(--lime);
  font-weight: 700;
}
.form-card {
  margin-top: 10px;
  padding: 0 11px;
  border-radius: 14px;
  background: #fff;
}
.form-card label {
  min-height: 49px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.form-card label span {
  width: 65px;
  flex: 0 0 auto;
  color: #596359;
  font-size: 10.5px;
  font-weight: 600;
}
.form-card input {
  flex: 1;
  height: 40px;
  border: 0;
  outline: none;
  font-size: 11px;
  text-align: right;
}
.form-card input::placeholder {
  color: #b2b7af;
}
.form-card > i {
  height: 1px;
  background: #f0eee8;
  margin-left: 73px;
}
.save-btn {
  width: 100%;
  height: 47px;
  margin-top: 12px;
  border: 0;
  border-radius: 24px;
  background: #18211a;
  color: var(--lime);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  font-size: 13px;
  font-weight: 800;
}
.save-btn img {
  width: 14px;
  height: 14px;
}
</style>
