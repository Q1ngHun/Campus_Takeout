<script setup>
defineProps({
  icon: { type: String, default: 'bag' },
  title: { type: String, default: '这里空空如也' },
  desc: { type: String, default: '去首页逛逛，发现宿舍楼下的好味道' },
  action: { type: String, default: '' }
})
defineEmits(['action'])
</script>

<template>
  <div class="empty-state">
    <div class="empty-art">
      <span class="empty-orb"></span>
      <img :src="`/icons/${icon}.svg`" alt="" />
      <span class="empty-spark">✦</span>
    </div>
    <h3>{{ title }}</h3>
    <p>{{ desc }}</p>
    <button v-if="action" @click="$emit('action')">{{ action }}</button>
  </div>
</template>

<style scoped>
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 54px 30px 26px;
  text-align: center;
}
.empty-art {
  position: relative;
  width: 118px;
  height: 118px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-orb {
  position: absolute;
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: #e9eedb;
}
.empty-art img {
  position: relative;
  width: 46px;
  height: 46px;
  opacity: 0.72;
}
.empty-spark {
  position: absolute;
  right: 3px;
  top: 9px;
  color: #b9e83e;
  font-size: 26px;
}
h3 {
  margin: 16px 0 0;
  font-size: 18px;
  font-weight: 800;
  letter-spacing: -0.3px;
}
p {
  margin: 7px 0 0;
  max-width: 250px;
  color: #8a9189;
  font-size: 12px;
  line-height: 1.7;
}
button {
  height: 40px;
  margin-top: 20px;
  padding: 0 24px;
  border: 0;
  border-radius: 20px;
  background: #18211a;
  color: #d7ff5e;
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}
</style>
