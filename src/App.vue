<script setup>
import { useImagesStore } from "./stores/imagesStore";
import ImageDropZone from "./components/ImageDropZone.vue";
import GlobalSettingView from "./components/GlobalSettingView.vue";
import CropPreviewGrid from "./components/CropPreviewGrid.vue";
const imagesStore = useImagesStore();
</script>

<template>
  <h1>Image Crop Tool</h1>
  <p>現在のファイル数 : {{ imagesStore.fileList.length }}</p>

  <div>
    <h2>画像切り抜き</h2>
    <ImageDropZone />
    <GlobalSettingView />
  </div>

  <CropPreviewGrid />
</template>

<style scoped></style>
