<script setup>import { useImagesStore } from './stores/imagesStore'
const imagesStore = useImagesStore()
console.log('store initialized : '+imagesStore.fileList)

</script>

<template>
  <h1>Image Crop Tool</h1>
  <p>現在のファイル数 : {{ imagesStore.fileList.length }}</p>
</template>

<style scoped>
</style>
