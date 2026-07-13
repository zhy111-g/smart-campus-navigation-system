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
import emblemUrl from '@/assets/sxufe-emblem.png'

export default {
  name: 'SchoolEmblem',
  props: {
    size: { type: [Number, String], default: 48 }
  },
  computed: {
    emblemSrc() {
      // webpack 打包进 assets，随 publicPath 自动带上正确前缀
      return emblemUrl
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
