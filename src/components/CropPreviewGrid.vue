<script setup>
import { ref } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import IndividualSettingDialog from "./IndividualSettingDialog.vue";

const imagesStore = useImagesStore();

/**
 * プレビュー枠（切り抜かれた後の形）のスタイルを計算
 */
const getClipContainerStyle = (file) => {
  const config = imagesStore.getFileCropConfig(file.previewUrl);
  const { width, height } = config.selection;

  // プレビュー枠の最大サイズ（カード内での上限）
  const maxDisplaySize = 160;
  const scale = Math.min(maxDisplaySize / width, maxDisplaySize / height, 1);

  return {
    width: `${width * scale}px`,
    height: `${height * scale}px`,
  };
};

/**
 * 画像を枠内で移動・縮小させるスタイルを計算
 */
const getImageTransformStyle = (file) => {
  const config = imagesStore.getFileCropConfig(file.previewUrl);
  const { x, y, width, height } = config.selection;

  // コンテナの縮尺に合わせるためのスケール計算
  const maxDisplaySize = 160;
  const displayScale = Math.min(
    maxDisplaySize / width,
    maxDisplaySize / height,
    1,
  );

  return {
    // 切り抜き開始位置(x, y)をマイナス方向にずらす
    transform: `translate(${-x * displayScale}px, ${-y * displayScale}px) scale(${displayScale})`,
  };
};

// --- ダイアログ制御用の状態 ---
const isDialogOpen = ref(false);
const selectedFile = ref(null);

// ボタンが押された時の処理
const openIndividualEditor = (file) => {
  selectedFile.value = file; // 編集対象のファイルをセット
  imagesStore.prepareIndividualEdit(file.previewUrl);
  isDialogOpen.value = true; // ダイアログを表示
};

const resetIndividualConfig = (previewUrl) => {
  imagesStore.clearFileCropConfig(previewUrl);
};

// ダイアログを閉じる処理
const closeEditor = () => {
  isDialogOpen.value = false;
  selectedFile.value = null;
};
</script>

<template>
  <div class="preview-grid-container">
    <h2 class="grid-title">
      切り抜きプレビュー（全 {{ imagesStore.totalImageCount }} 枚）
    </h2>

    <div class="preview-grid">
      <div
        v-for="file in imagesStore.displayFileList"
        :key="file.previewUrl"
        class="preview-card"
      >
        <div class="image-viewport">
          <div :style="getClipContainerStyle(file)" class="clip-boundary">
            <img
              :src="file.previewUrl"
              :style="getImageTransformStyle(file)"
              class="preview-image"
            />
          </div>
        </div>

        <div class="card-footer">
          <p class="file-name" :title="file.name">
            {{ file.name }}
          </p>
          <button @click="openIndividualEditor(file)" class="edit-button">
            個別に設定
          </button>
          <button
            v-if="file.cropConfig"
            @click="resetIndividualConfig(file.previewUrl)"
            class="reset-button"
          >
            個別設定を破棄
          </button>
        </div>
      </div>
    </div>
    <IndividualSettingDialog
      v-if="isDialogOpen"
      :file="selectedFile"
      @close="closeEditor"
    />
  </div>
</template>

<style scoped>
/* コンテナ全体のスタイル */
.preview-grid-container {
  padding: 1rem;
}

.grid-title {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 1rem;
}

/* グリッドレイアウト：4列（画面幅に合わせて自動調整） */
.preview-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

/* カードのデザイン */
.preview-card {
  background-color: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease;
}

/* プレビュー表示窓（正方形を維持） */
.image-viewport {
  position: relative;
  background-color: #f5f5f5;
  aspect-ratio: 1 / 1; /* 正方形 */
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

/* 青い枠線（切り抜き範囲） */
.clip-boundary {
  position: relative;
  overflow: hidden;
  border: 1px solid #3182ce;
  background-color: #fff;
}

/* 画像自体のリセット */
.preview-image {
  position: absolute;
  top: 0;
  left: 0;
  max-width: none;
  transform-origin: top left;
}

/* カード下部 */
.card-footer {
  padding: 0.75rem;
  border-top: 1px solid #edf2f7;
  background-color: #f8fafc;
  flex-grow: 1;
}

.file-name {
  font-size: 0.75rem;
  color: #4a5568;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0 0 0.5rem 0;
}

/* 編集ボタン */
.edit-button {
  width: 100%;
  padding: 0.4rem 0.75rem;
  margin-bottom: 0.2rem;
  font-size: 0.875rem;
  background-color: #3182ce;
  color: #ffffff;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.edit-button:hover {
  background-color: #2b6cb0;
}

/* リセットボタン */
.reset-button {
  width: 100%;
  padding: 0.4rem 0.75rem;
  font-size: 0.875rem;
  background-color: #dfdfdf;
  color: #353535;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}
</style>
