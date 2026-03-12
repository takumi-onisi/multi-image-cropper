<script setup>
import { useTemplateRef, ref, computed, onMounted, watch } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import { CROPPER_TEMPLATE } from "../constants/cropperTemplate";
import Cropper from "cropperjs";
import { performCropping, convertToZipItem } from "../utils/imageProcessor";
import { downloadFilesAsZip } from "../utils/zip";

const imageStore = useImagesStore();
const imageElement = useTemplateRef("imageElement");
let cropper = null;

// 一枚目の画像を取得
const firstImage = computed(() => imageStore.fileList[0]);

const rect = ref({ x: 0, y: 0, width: 0, height: 0 });

// 2. 数値入力から Cropper（枠）へ
const updateSelection = () => {
  const selection = cropper.getCropperSelection();
  if (selection) {
    // フォームの値をCropperに代入
    selection.x = rect.value.x;
    selection.y = rect.value.y;
    selection.width = rect.value.width;
    selection.height = rect.value.height;

    // Cropper v2の重要なメソッド：プロパティの変更を画面に強制反映させる
    selection.$change();
  }
};

const initCropper = () => {
  if (cropper) cropper.destroy();
  if (!imageElement.value) return;

  cropper = new Cropper(imageElement.value, { template: CROPPER_TEMPLATE });

  cropper.getCropperSelection().addEventListener("change", () => {
    const selection = cropper.getCropperSelection();
    if (selection) {
      // 画面表示用に整数に丸める
      rect.value.x = Math.round(selection.x);
      rect.value.y = Math.round(selection.y);
      rect.value.width = Math.round(selection.width);
      rect.value.height = Math.round(selection.height);
    }
  });
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

  const rect = cropperImage.getBoundingClientRect();
  const baseImageWidth = rect.width;
  const baseImageHeight = rect.height;

  // 代表の設定をストアに保存(これが各ファイルにデフォルトのcropConfigとして設定される)
  imageStore.setGlobalConfig({
    selection: {
      x: cropperSelection.x,
      y: cropperSelection.y,
      width: cropperSelection.width,
      height: cropperSelection.height,
    },
    transform: cropperImage.$getTransform(),
    baseSize: { width: baseImageWidth, height: baseImageHeight },
  });

  processAll();
};

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

    // ロジックの実行（performCroppingへ委譲）
    return await performCropping(img, fileItem.cropConfig);
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
</script>

<template>
  <div v-if="firstImage" class="cropper-container">
    <div class="cropper-wrapper">
      <div class="property-bar">
        <div class="input-group">
          <label>X:</label>
          <input
            type="number"
            v-model.number="rect.x"
            @input="updateSelection"
          />
        </div>
        <div class="input-group">
          <label>Y:</label>
          <input
            type="number"
            v-model.number="rect.y"
            @input="updateSelection"
          />
        </div>
        <div class="input-group">
          <label>幅:</label>
          <input
            type="number"
            v-model.number="rect.width"
            @input="updateSelection"
          />
        </div>
        <div class="input-group">
          <label>高さ:</label>
          <input
            type="number"
            v-model.number="rect.height"
            @input="updateSelection"
          />
        </div>
      </div>
      <img
        ref="imageElement"
        :src="firstImage.previewUrl"
        class="cropper-img"
      />

      <div class="button-area">
        <button class="confirm-btn" @click="confirmCrop">
          設定を確定して切り抜き
        </button>
      </div>
    </div>
  </div>

  <div v-if="testResultUrl" class="test-preview">
    <h3>テスト切り抜き結果:</h3>
    <img :src="testResultUrl" style="border: 2px solid #2ecc71" />
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
