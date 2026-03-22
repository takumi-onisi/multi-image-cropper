<script setup>
import { useTemplateRef, ref, computed, onMounted, watch, nextTick } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import { CROPPER_TEMPLATE } from "../constants/cropperTemplate";
import Cropper from "cropperjs";
import { performCropping, convertToZipItem } from "../utils/imageProcessor";
import { downloadFilesAsZip } from "../utils/zip";
import PropertyBar from "../components/PropertyBar.vue";
import {
  convertViewToSource,
  convertSourceToView,
} from "../utils/pixelConverter";

const imageStore = useImagesStore();
const imageElement = useTemplateRef("imageElement");
let cropper = null;
// cropperインスタンスのselectionとプロパティバーのループ防止用フラグ
let isInternalSync = false;

// 一枚目の画像を取得
const firstImage = computed(() => imageStore.fileList[0]);

const initCropper = () => {
  if (cropper) cropper.destroy();
  if (!imageElement.value) return;

  cropper = new Cropper(imageElement.value, { template: CROPPER_TEMPLATE });
  // Cropper側の変更をストアに送る
  const syncToStore = () => {
    if (isInternalSync) return; // watch経由の更新なら無視する

    const selection = cropper.getCropperSelection();
    const transform = cropper.getCropperImage().$getTransform();

    isInternalSync = true;
    imageStore.updatePreviewConfig(firstImage.previewUrl, {
      selection: {
        x: selection.x,
        y: selection.y,
        width: selection.width,
        height: selection.height,
      },
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
  () => imageStore.getFileCropConfig(firstImage.previewUrl),
  (newConfig) => {
    if (isInternalSync || !cropper) return; // 自分が原因の更新なら無視する

    const selection = cropper.getCropperSelection();

    isInternalSync = true;
    // 座標の反映
    Object.assign(selection, newConfig.selection);

    selection.$change(); // 画面更新をキック

    nextTick(() => {
      isInternalSync = false;
    });
  },
  { deep: true },
);

const generateCanvas = async (fileItem) => {
  if (!fileItem?.previewUrl) throw new Error("不正なデータ");

  // DOMの構築（副作用）
  const container = document.createElement("div");
  container.style.position = "fixed";
  container.style.left = "-9999px"; // 画面外へ飛ばす
  container.style.top = "0";
  container.style.opacity = "0";
  document.body.appendChild(container);
  // コンテナとimg要素を実際のdomに追加しないとcropperが正常に動作しない
  const img = document.createElement("img");
  container.appendChild(img);

  try {
    // 画像読み込みのPromiseをラップ
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = () =>
        reject(new Error(`画像読み込み失敗: ${fileItem.name}`));
      img.src = fileItem.previewUrl; // 画像の読み込み開始
    });

    // ファイルに適用される切り抜き用設定を取得
    const cropConfig = imageStore.getFileCropConfig(fileItem.previewUrl);
    // ロジックの実行（performCroppingへ委譲）
    return await performCropping(img, cropConfig);
  } finally {
    // 後片付け（副作用）
    if (container.parentNode) document.body.removeChild(container);
  }
};

const processAll = async () => {
  const files = imageStore.fileList;
  const processedCanvases = [];

  for (const file of files) {
    try {
      // 1枚ずつ順番に await
      const canvas = await generateCanvas(file);

      // 成功したら配列に保存（またはZIPに追加）
      processedCanvases.push({
        name: file.name,
        canvas: canvas,
      });

      console.log(`成功: ${file.name}`);
    } catch (err) {
      // reject された場合でも、ここでキャッチすればループは止まらない
      console.error(`失敗: ${file.name} - 理由: ${err.message}`);
      // 必要に応じてユーザーに「失敗したファイルがある」ことを知らせるフラグを立てる
    }
  }

  console.log("全件の処理が完了しました", processedCanvases);

  // ファイル形式（将来的にユーザー設定等から取得することを想定）
  const exportType = "image/png";
  // Canvasの配列をZIP用のデータ配列に変換
  const zipFilePromises = processedCanvases.map((item) =>
    convertToZipItem(item, exportType),
  );
  const zipFiles = await Promise.all(zipFilePromises);

  // ZIP化してダウンロード
  await downloadFilesAsZip(zipFiles);
  // メモリ解放：Canvas要素は巨大なので使い終わったらクリアするのが安全
  processedCanvases.forEach((item) => {
    item.canvas.width = 0;
    item.canvas.height = 0;
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

// ストア(View基準) -> プロパティバー(Source基準)
const displayConfig = computed(() => {
  const rawConfig = imageStore.getFileCropConfig(firstImage.previewUrl);

  // 計算に必要な材料（cropper）がなければ、ストアの値をそのまま渡す
  // (ストア側で初期値が保証されている前提)
  if (!cropper) return rawConfig;

  const context = getTransformationContext(cropper);
  if (!context) return rawConfig;

  // 材料が揃っている時だけ、変換ロジックを通す
  return {
    ...rawConfig,
    selection: convertViewToSource(rawConfig.selection, context),
  };
});

// プロパティバー(Source基準) -> ストア(View基準)
const handleUpdateConfig = (newConfig) => {
  // A. 環境ガード: 計算に必要なインスタンスがなければ何もしない
  if (!cropper) return;

  // B. 値のバリデーション:
  // ユーザーが入力中の「空文字」や、予期せぬ NaN をチェック
  const s = newConfig.selection;
  const isInvalid = [s.x, s.y, s.width, s.height].some(
    (val) => val === "" || val === null || isNaN(val),
  );

  // 異常な入力の場合は、ストアを更新せずに現在の状態をキープする
  if (isInvalid) return;

  // C. コンテキスト取得
  const context = getTransformationContext(cropper);
  if (!context) return;

  // D. 座標変換 (画像基準 -> 表示基準)
  const viewSelection = convertSourceToView(s, context);

  // E. ストア更新 (既存の transform を維持しつつ、計算済みの座標を適用)
  imageStore.updatePreviewConfig(firstImage.previewUrl, {
    ...newConfig, // transform 等を保持
    selection: viewSelection,
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
  <div v-if="firstImage" class="cropper-container">
    <div class="cropper-wrapper">
      <PropertyBar
        :config="displayConfig"
        @update:config="handleUpdateConfig"
      />
      <img
        ref="imageElement"
        :src="firstImage.previewUrl"
        class="cropper-img"
      />

      <div class="button-area">
        <button class="confirm-btn" @click="processAll">
          設定を確定して切り抜き
        </button>
      </div>
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
  width: 50vw !important;
  height: 50vw !important;
}

.button-area {
  width: 100%;
  display: flex;
  justify-content: center;
}

.confirm-btn {
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}
</style>
