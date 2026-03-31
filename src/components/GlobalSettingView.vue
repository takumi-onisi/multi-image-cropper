<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import CropperPanel from "./CropperPanel.vue";
import CropExecuteButton from "./CropExecuteButton.vue";

const imagesStore = useImagesStore();
</script>

<template>
  <CropperPanel
    v-if="imagesStore.globalPreviewFile"
    :image="imagesStore.globalPreviewFile"
  />

  <div v-if="imagesStore.globalPreviewFile" class="button-area">
    <CropExecuteButton />
  </div>
</template>

<style>
.button-area {
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
