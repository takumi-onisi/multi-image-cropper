<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import CropperPanel from "./CropperPanel.vue";
import CropExecuteButton from "./CropExecuteButton.vue";
import ExportTypeSelector from "./ExportTypeSelector.vue";

const imagesStore = useImagesStore();
</script>

<template>
  <CropperPanel
    v-if="imagesStore.globalPreviewFile"
    :image="imagesStore.globalPreviewFile"
  />

  <div v-if="imagesStore.globalPreviewFile" class="button-area">
    <div class="button-grid">
      <div class="side-spacer"></div>

      <div class="center-button">
        <CropExecuteButton />
      </div>

      <div class="right-selector">
        <ExportTypeSelector :file="imagesStore.globalPreviewFile" />
      </div>
    </div>
  </div>
</template>

<style scoped>
.button-grid {
  display: grid;
  /* 3列構成: 左・ボタン・右 */
  grid-template-columns: 1fr auto 1fr;
  align-items: stretch;
  width: 100%;
  gap: 10px;
}

.center-button {
  justify-self: center; /* ボタンを中央セルの中で中央へ */
}

.right-selector {
  height: 100%;
  display: flex;
}

.right-selector > * {
  height: 100%;
}

/* 画面幅が狭いとき、またはセレクターが押し出されるとき */
@media (max-width: 600px) {
  .button-grid {
    grid-template-columns: 1fr; /* 1列に変更 */
    gap: 10px;
  }
  .side-spacer {
    display: none;
  }
  .center-button {
    justify-self: center;
  }
  .right-selector {
    justify-self: center;
  }
}
</style>
