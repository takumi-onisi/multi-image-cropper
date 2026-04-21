<script setup>
import { useImagesStore } from "./stores/imagesStore";
import ImageDropZone from "./components/ImageDropZone.vue";
import GlobalSettingView from "./components/GlobalSettingView.vue";
import CropPreviewGrid from "./components/CropPreviewGrid.vue";
import AppHeader from "./components/AppHeader.vue";
import "./assets/css/main.css";
const imagesStore = useImagesStore();
imagesStore.initTutorial();
</script>

<template>
  <AppHeader />

  <div class="container">
    <ImageDropZone />
    <GlobalSettingView />
  </div>

  <div class="container">
    <CropPreviewGrid />
  </div>
</template>

<style scoped></style>
