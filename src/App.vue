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
      <div class="inner">
        <ImageDropZone />
        <div class="main-layout">
          <section class="left-panel">
            <GlobalSettingView />
          </section>

          <div class="layout-separator"></div>

          <section class="right-panel">
            <CropPreviewGrid />
          </section>
        </div>
      </div>
    </main>

    <AppFooter />
  </div>
</template>

<style scoped>
.inner {
  margin: 2rem 0;
  padding: 0 1.5rem;
}

.main-layout {
  display: flex;
  flex-wrap: nowrap;
  padding: 0 20px;
  max-width: 1600px; /* 必要に応じて最大幅を設定 */
  margin: 2rem auto;
  /* 左側の GlobalSettingView の高さに右側を強制的に合わせる */
  align-items: stretch;
}

.left-panel {
  flex: 1;
  min-width: var(
    --breakpoint-mobile
  ); /* 左側の最小幅。これを下回ると折り返す */
}

.right-panel {
  flex: 0 1 500px; /* 基本500px。幅が狭まると縮小（flex-shrink: 1）する */
  height: auto; /* 子要素（CropPreviewGrid）に高さを渡すため */
  display: flex;
  flex-direction: column;
  max-height: 100vh;
}

/* セパレーターの基本スタイル（横並び時：縦線） */
.layout-separator {
  width: 1px;
  background-color: #ddd; /* 線の色 */
  margin: 1rem 24px; /* 左右に余白を作る */
  align-self: stretch; /* 親（main-layout）の高さ一杯に伸ばす */
}

/* 縦積みになった時の調整 */
@media (max-width: 1200px) {
  .left-panel,
  .right-panel {
    flex: 1 1 100%;
    min-width: 0;
  }

  .main-layout {
    flex-direction: column; /* 縦積みに変更 */
  }
  .layout-separator {
    width: 100%; /* 横幅一杯に広げる */
    height: 1px; /* 高さを 1px にして横線にする */
    margin: 24px 0; /* 上下に余白を作る */
  }
}
</style>
