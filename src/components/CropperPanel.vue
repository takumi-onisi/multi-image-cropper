<script setup>
import { useTemplateRef, ref, computed, onMounted, watch, nextTick } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import { CROPPER_TEMPLATE } from "../constants/cropperTemplate";
import Cropper from "cropperjs";
import PropertyBar from "../components/PropertyBar.vue";
import {
  convertViewToSource,
  convertSourceToView,
} from "../utils/pixelConverter";

const imagesStore = useImagesStore();
const imageElement = useTemplateRef("imageElement");
let cropper = null;
// cropperインスタンスのselectionとプロパティバーのループ防止用フラグ
let isInternalSync = false;
const props = defineProps({
  // 切り抜き対象の画像
  image: {
    type: Object,
    required: true,
  },
});

const initCropper = () => {
  if (cropper) cropper.destroy();
  if (!imageElement.value) return;

  cropper = new Cropper(imageElement.value, { template: CROPPER_TEMPLATE });
  // Cropper側の変更をストアに送る
  const syncToStore = () => {
    if (isInternalSync) return; // watch経由の更新なら無視する

    const context = getTransformationContext(cropper);
    const selection = cropper.getCropperSelection();
    const transform = cropper.getCropperImage().$getTransform();
    const sourceSelection = convertViewToSource(selection, context);

    isInternalSync = true;
    imagesStore.updatePreviewConfig(props.image.previewUrl, {
      selection: sourceSelection, // 画像の大きさ基準でストアに保存
      transform: transform,
    });

    // ストアへの反映完了後にフラグを下ろす
    nextTick(() => {
      isInternalSync = false;
    });
  };
  cropper.getCropperSelection().addEventListener("change", syncToStore);
  cropper.getCropperImage().addEventListener("transform", syncToStore);
};

// 2. ストアの変更をCropperに反映する
watch(
  () => imagesStore.getFileCropConfig(props.image.previewUrl),
  (newConfig, oldConfig) => {
    if (isInternalSync || !cropper) return; // 自分が原因の更新なら無視する

    // 前回の設定値と今回の設定値が全く同じなら、Vueの誤検知として無視する
    if (
      JSON.stringify(newConfig.selection) ===
      JSON.stringify(oldConfig?.selection)
    ) {
      return;
    }

    const context = getTransformationContext(cropper);
    const selection = cropper.getCropperSelection();
    const sourceSelection = convertSourceToView(newConfig.selection, context);

    isInternalSync = true;
    // 座標の反映
    Object.assign(selection, sourceSelection);

    nextTick(() => {
      isInternalSync = false;
    });
  },
  { deep: true },
);

// 一枚目の画像が読み込まれたら初期化
watch(
  props.image,
  () => {
    // DOMが更新されるのを待ってから初期化
    setTimeout(initCropper, 100);
  },
  { immediate: true },
);

// ストア(View基準) -> プロパティバー(Source基準)
const displayConfig = computed(() => {
  const rawConfig = imagesStore.getFileCropConfig(props.image.previewUrl);

  // 計算に必要な材料（cropper）がなければ、ストアの値をそのまま渡す
  // (ストア側で初期値が保証されている前提)
  if (!cropper) return rawConfig;

  const context = getTransformationContext(cropper);
  if (!context) return rawConfig;

  // 材料が揃っている時だけ、変換ロジックを通す
  return {
    ...rawConfig,
  };
});

// プロパティバー(Source基準) -> ストア(View基準)
const handleUpdateConfig = (newConfig) => {
  // 環境ガード: 計算に必要なインスタンスがなければ何もしない
  if (!cropper) return;

  // 値のバリデーション:
  // ユーザーが入力中の「空文字」や、予期せぬ NaN をチェック
  const s = newConfig.selection;
  const isInvalid = [s.x, s.y, s.width, s.height].some(
    (val) => val === "" || val === null || isNaN(val),
  );

  // 異常な入力の場合は、ストアを更新せずに現在の状態をキープする
  if (isInvalid) return;

  // コンテキスト取得
  const context = getTransformationContext(cropper);
  if (!context) return;

  // ストア更新 (プロパティバーの値をそのまま適用)
  imagesStore.updatePreviewConfig(props.image.previewUrl, {
    ...newConfig,
  });
};

/**
 * 現在のCropperの状態から変換用のパラメータを抽出する
 */
function getTransformationContext(cropper) {
  const container = cropper.container;
  const canvasRect = container
    .querySelector("cropper-canvas")
    .getBoundingClientRect();
  const imageRect = container
    .querySelector("cropper-image")
    .getBoundingClientRect();
  const transform = cropper.getCropperImage().$getTransform();

  return {
    // 画像の左上端がCanvasの左上端からどれだけ離れているか
    offset: {
      x: imageRect.left - canvasRect.left,
      y: imageRect.top - canvasRect.top,
    },
    // 現在の表示倍率
    scale: {
      x: transform[0],
      y: transform[3],
    },
  };
}
</script>

<template>
  <div v-if="props.image" class="cropper-container">
    <div class="cropper-wrapper">
      <PropertyBar
        :config="displayConfig"
        @update:config="handleUpdateConfig"
      />
      <img
        ref="imageElement"
        :src="props.image.previewUrl"
        class="cropper-img"
      />
    </div>
  </div>
</template>

<style scoped>
.cropper-container {
  display: flex;
  justify-content: center;
  padding: 20px;
}

.cropper-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}

.cropper-img {
  display: none;
}

:deep(cropper-canvas) {
  margin: auto;
  width: 70vh !important;
  height: 70vh !important;
}
/* 
.button-area {
  width: 100%;
  display: flex;
  justify-content: center;
} */
</style>
