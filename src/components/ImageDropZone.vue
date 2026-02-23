<script setup>
import { useImagesStore } from '../stores/imagesStore';
const store = useImagesStore();

const handleDrop = (e) => {
  const files = e.dataTransfer.files;
  if (files.length > 0) {
    // ストアの関数のテスト
    store.addFiles(files);
  }
};
</script>

<template>
  <div 
    @dragover.prevent 
    @drop.prevent="handleDrop"
    style="border: 2px dashed #000; padding: 50px; text-align: center;"
  >
    ここに画像をドロップしてください
  </div>
</template>