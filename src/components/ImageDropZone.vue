<script setup>
import { useImagesStore } from "../stores/imagesStore";
import {
  MAX_FILE_COUNT,
  MAX_SINGLE_FILE_SIZE,
  MAX_TOTAL_FILE_SIZE,
  ALLOWED_IMAGE_MIME_TYPES,
} from "../constants/config";

// 表示用にバイトをメガバイトに変換
const MAX_SINGLE_MB = MAX_SINGLE_FILE_SIZE / (1024 * 1024);
const MAX_TOTAL_MB = MAX_TOTAL_FILE_SIZE / (1024 * 1024);
const formatLabels = ALLOWED_IMAGE_MIME_TYPES.map((mime) => {
  const ext = mime.split("/")[1].toUpperCase();
  return ext === "JPEG" ? "JPG" : ext; // JPEGはJPGと表示したほうが一般的
}).join(" / ");
const store = useImagesStore();

const handleDrop = (e) => {
  const files = e.dataTransfer.files;
  if (files.length === 0) return;

  if (store.totalImageCount > 0 && !store.doneTutorial) {
    // 初回ドロップ時チュートリアル用の画像をクリア
    store.clearFiles();
    store.doneTutorial = true;
  }
  store.addFiles(files);
};

const clearFiles = () => {
  store.clearFiles();
};
</script>

<template>
  <div class="drop-zone" @drop.prevent="handleDrop" @dragover.prevent>
    <div class="drop-content">
      <p class="main-text">ここに画像をドロップしてください</p>

      <div class="limit-info">
        <p>最大 {{ MAX_FILE_COUNT }} 枚まで一括処理可能</p>
        <div class="sub-info">
          <span>1枚あたり: {{ MAX_SINGLE_MB }}MB まで</span>
          <span class="separator">|</span>
          <span>合計容量: {{ MAX_TOTAL_MB }}MB まで</span>
        </div>
        <p class="supported-formats">対応形式: {{ formatLabels }}</p>
        <p
          v-if="store.totalImageCount > 0"
          class="clear-button"
          @click="clearFiles"
        >
          現在の画像をクリア
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.drop-zone {
  border: 2px dashed #000;
  padding: 50px;
  text-align: center;
}

.drop-content {
  margin: auto;
  padding: 30px;
  background-color: var(--color-bg-inset);
  border-radius: 8px;
}

.main-text {
  font-size: 1.25rem;
  font-weight: bold;
  margin-bottom: 12px;
}

.limit-info {
  font-size: 0.875rem;
  line-height: 1.6;
  padding: 10px 20px;
  border-radius: 6px;
}

.sub-info {
  display: flex;
  justify-content: center;
  gap: 10px;
  color: var(--text-sub);
}

.separator {
  color: #d1d5db;
}

.supported-formats {
  margin-top: 4px;
  letter-spacing: 0.05em;
}
.clear-button {
  margin-top: 1.5rem;
  line-height: 1.6;
  text-decoration: underline;
  cursor: pointer;
}
</style>
