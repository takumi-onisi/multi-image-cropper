<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import CropperPanel from "./CropperPanel.vue";
import CropExecuteButton from "./CropExecuteButton.vue";

const imagesStore = useImagesStore();
const firstImage = computed(() => imagesStore.fileList[0]);
</script>

<template>
  <CropperPanel v-if="firstImage" :image="firstImage" />

  <div v-if="firstImage" class="button-area">
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
