<script setup>
import { onMounted } from "vue";
import { useImagesStore } from "./stores/imagesStore";
import AppHeroSection from "./components/AppHeroSection.vue";
import ImageDropZone from "./components/ImageDropZone.vue";
import GlobalSettingView from "./components/GlobalSettingView.vue";
import CropPreviewGrid from "./components/CropPreviewGrid.vue";
import AppHeader from "./components/AppHeader.vue";
import AppFooter from "./components/AppFooter.vue";
import "./assets/css/main.css";
const imagesStore = useImagesStore();
onMounted(() => {
  imagesStore.initTutorial();
});
</script>

<template>
  <div class="app-wrapper">
    <AppHeader />

    <main class="content">
      <AppHeroSection />
      <div class="container">
        <ImageDropZone />
        <GlobalSettingView />
      </div>

      <div class="container">
        <CropPreviewGrid />
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.app-wrapper {
  display: flex;
  flex-direction: column;
  /* 最低でも画面いっぱいの高さを確保する */
  min-height: 100vh;
}

.content {
  flex: 1;
}
</style>
