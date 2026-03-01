<script setup>
import { useTemplateRef, ref, computed, onMounted, watch } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import { CROPPER_TEMPLATE } from "../constants/cropperTemplate";
import Cropper from "cropperjs";

const imageStore = useImagesStore();
const imageElement = useTemplateRef("imageElement");
let cropper = null;

// 一枚目の画像を取得
const firstImage = computed(() => imageStore.fileList[0]);

const initCropper = () => {
  if (cropper) cropper.destroy();
  if (!imageElement.value) return;

  cropper = new Cropper(imageElement.value, { template: CROPPER_TEMPLATE });
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
  const cropperImage = cropper.getCropperImage();
  if (!cropperSelection || !cropperImage) return;

  // 代表の設定をストアに保存(これが各ファイルにデフォルトのcropConfigとして設定される)
  imageStore.setGlobalConfig({
    selection: {
      x: cropperSelection.x,
      y: cropperSelection.y,
      width: cropperSelection.width,
      height: cropperSelection.height,
    },
    transform: cropperImage.$getTransform(),
  });

  const fileItem = imageStore.fileList[1]; // テスト: 2枚目の画像を切り抜く

  const canvas = await generateCanvas(fileItem);

  testResultUrl.value = canvas.toDataURL("image/png");
};

const generateCanvas = async (fileItem) => {
  if (!fileItem || !fileItem.previewUrl) {
    return new Error("ファイルデータが不正です");
  }

  // メモリ上に仮想のCropperを作成する
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px"; // 画面外へ飛ばす
  container.style.top = "0";
  container.style.opacity = "0";
  document.body.appendChild(container);

  // 画像の読み込み完了を待つ Promise を作成
  return new Promise(async (resolve, reject) => {
    const img = document.createElement("img");
    container.appendChild(img);
    img.onerror = () => {
      document.body.removeChild(container);
      reject(new Error(`画像の読み込みに失敗しました: ${fileItem.name}`));
    };
    // 読み込み成功時のメインロジック
    img.onload = async () => {
      const tempCropper = new Cropper(img, {
        template: CROPPER_TEMPLATE,
      });

      await tempCropper.$ready;

      const cropperSelection = tempCropper.getCropperSelection();
      const cropperImage = tempCropper.getCropperImage();

      // 各ファイルごとの切り抜き設定を注入
      cropperSelection.x = fileItem.cropConfig.selection.x;
      cropperSelection.y = fileItem.cropConfig.selection.y;
      cropperSelection.width = fileItem.cropConfig.selection.width;
      cropperSelection.height = fileItem.cropConfig.selection.height;
      cropperImage.$setTransform(...fileItem.cropConfig.transform);
      // 切抜き
      const canvas = await cropperSelection.$toCanvas();
      // 正常終了：後片付け
      tempCropper.destroy();
      document.body.removeChild(container);
      resolve(canvas);
    };

    // 切抜き画像の読み込み開始
    img.src = fileItem.previewUrl;
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
