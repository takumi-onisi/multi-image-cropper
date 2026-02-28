<script setup>
import { useImagesStore } from "./stores/imagesStore";
import ImageDropZone from "./components/ImageDropZone.vue";
import CropperPanel from "./components/CropperPanel.vue";
const imagesStore = useImagesStore();
</script>

<template>
  <h1>Image Crop Tool</h1>
  <p>現在のファイル数 : {{ imagesStore.fileList.length }}</p>

  <div>
    <h2>画像切り抜き</h2>
    <ImageDropZone />
    <CropperPanel />
  </div>

</template>

<style scoped></style>
