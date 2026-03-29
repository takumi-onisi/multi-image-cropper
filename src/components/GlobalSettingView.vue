<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import CropperPanel from "./CropperPanel.vue";
import CropExecuteButton from "./CropExecuteButton.vue";

const imagesStore = useImagesStore();
const filesUploaded = computed(() => imagesStore.fileList.length > 0);
</script>

<template>
  <CropperPanel />
  <div v-if="filesUploaded" class="button-area">
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
