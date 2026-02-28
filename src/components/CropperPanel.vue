<script setup>
import { useTemplateRef, ref, computed, onMounted, watch } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import Cropper from "cropperjs";

const imageStore = useImagesStore();
const imageElement = useTemplateRef("imageElement");
let cropper = null;

// 一枚目の画像を取得
const firstImage = computed(() => imageStore.fileList[0]);

const initCropper = () => {
  if (cropper) cropper.destroy();
  if (!imageElement.value) return;

  const template = `
  <cropper-canvas background>
    <cropper-image translatable scalable>
    </cropper-image>
    <cropper-handle action="move" plain></cropper-handle>

    <cropper-shade></cropper-shade>

    <cropper-selection initial-coverage="0.5" movable resizable>
      <cropper-grid role="grid" bordered covered></cropper-grid>
      <cropper-crosshair centered></cropper-crosshair>
      
      <cropper-handle action="move" plain></cropper-handle>
      
      <cropper-handle action="n-resize"></cropper-handle>
      <cropper-handle action="e-resize"></cropper-handle>
      <cropper-handle action="s-resize"></cropper-handle>
      <cropper-handle action="w-resize"></cropper-handle>
      <cropper-handle action="ne-resize"></cropper-handle>
      <cropper-handle action="nw-resize"></cropper-handle>
      <cropper-handle action="se-resize"></cropper-handle>
      <cropper-handle action="sw-resize"></cropper-handle>
    </cropper-selection>
  </cropper-canvas>
  `;

  cropper = new Cropper(imageElement.value, { template });
};

const saveConfig = () => {
  if (!cropper) return;

  // データを取得
  const cropperSelection = cropper.getCropperSelection();
  const cropperImage = cropper.getCropperImage();

  if (!cropperSelection || !cropperImage) return;

  // 枠の座標とサイズを取得
  const selectionData = {
    x: cropperSelection.x,
    y: cropperSelection.y,
    width: cropperSelection.width,
    height: cropperSelection.height,
  };

  // 画像の変形状態（移動・拡大・回転）を取得
  const imageData = cropperImage.$getTransform();
  console.log(imageData);
};

const testResultUrl = ref(null);

const confirmCrop = async () => {
  if (!cropper) return;

  const cropperSelection = cropper.getCropperSelection();
  if (!cropperSelection) return;

  const canvas = await cropperSelection.$toCanvas();

  if (!canvas) return;
  testResultUrl.value = canvas.toDataURL("image/png");

  const cropperImage = cropper.getCropperImage();
  imageStore.setGlobalConfig({
    selection: {
      x: cropperSelection.x,
      y: cropperSelection.y,
      width: cropperSelection.width,
      height: cropperSelection.height,
    },
    transform: cropperImage.$getTransform(),
  });
};

// 一枚目の画像が読み込まれたら初期化
watch(
  firstImage,
  () => {
    // DOMが更新されるのを待ってから初期化
    setTimeout(initCropper, 100);
  },
  { immediate: true },
);
</script>

<template>
  <div v-if="firstImage" class="cropper-container">
    <img ref="imageElement" :src="firstImage.previewUrl" class="cropper-img" />
    <button @click="confirmCrop">設定を確定してテスト切り抜き</button>
  </div>

  <div v-if="testResultUrl" class="test-preview">
    <h3>テスト切り抜き結果:</h3>
    <img :src="testResultUrl" style="border: 2px solid #2ecc71" />
  </div>
</template>

<style scoped>
.cropper-img {
  display: block;
  max-width: 100%;
}
/* 画像の上で移動用ポインターを表示 */
cropper-image[action="move"] {
  cursor: move; /* 十字矢印のポインター */
}
</style>
