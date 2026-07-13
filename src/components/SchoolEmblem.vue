<template>
  <img
    :src="emblemSrc"
    :width="size"
    :height="size"
    class="school-emblem"
    alt="山西财经大学校徽"
    draggable="false"
  />
</template>

<script>
export default {
  name: 'SchoolEmblem',
  props: {
    size: { type: [Number, String], default: 48 }
  },
  computed: {
    // 使用 public 目录，避免 webpack 打包失败导致整页白屏
    emblemSrc() {
      return (process.env.BASE_URL || '/') + 'sxufe-emblem.png'
    }
  }
}
</script>

<style scoped>
.school-emblem {
  display: block;
  flex-shrink: 0;
  object-fit: contain;
  background: transparent;
}
</style>
