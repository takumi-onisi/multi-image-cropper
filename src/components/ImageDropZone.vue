<script setup>
import { ref } from "vue";
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
const fileInput = ref(null); // input要素への参照

const addFilesToStore = (files) => {
  if (files.length === 0) return;
  store.addFiles(files);
};

// ドラッグ&ドロップ用
const handleDrop = (e) => {
  addFilesToStore(e.dataTransfer.files);
};

// ファイル選択ボタン用
const handleFileSelect = (e) => {
  addFilesToStore(e.target.files);
  // 同じファイルを連続で選択しても反応するようにリセット
  e.target.value = "";
};

const clearFiles = () => {
  store.clearFiles();
};
</script>

<template>
  <div class="drop-zone" @drop.prevent="handleDrop" @dragover.prevent>
    <div class="drop-content">
      <!-- スマホとPCでテキストを切り替え -->
      <p class="main-text pc-only">ここに画像をドロップしてください</p>
      <p class="main-text mobile-only">切り抜く画像を選択してください</p>

      <!-- 見た目用のデザインされたボタンを label で作成 -->
      <label for="file-upload" class="custom-file-upload">
        ファイルを選択
      </label>
      <!-- ファイル選択用 input -->
      <div class="file-select-container">
        <input
          type="file"
          ref="fileInput"
          multiple
          :accept="ALLOWED_IMAGE_MIME_TYPES.join(',')"
          @change="handleFileSelect"
          class="file-input"
          style="display: none"
        />
      </div>

      <div class="limit-info">
        <p class="sub-text">最大 {{ MAX_FILE_COUNT }} 枚まで一括処理可能</p>
        <div class="sub-info">
          <span>1枚あたり: {{ MAX_SINGLE_MB }}MB まで</span>
          <span class="separator">|</span>
          <span>合計容量: {{ MAX_TOTAL_MB }}MB まで</span>
        </div>
        <p class="sub-text">対応形式: {{ formatLabels }}</p>
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

/* PC/スマホ出し分け用の基本設定 */
.mobile-only {
  display: none;
}
.pc-only {
  display: block;
}

/* ファイル選択ボタンの見た目（中央寄せ） */
.custom-file-upload {
  display: inline-block;
  padding: 8px 20px;
  font-size: var(--font-size-base);
  cursor: pointer;
  background-color: var(--primary-color);
  color: white;
  border-radius: 4px;
  margin: 15px 0;
  transition: background-color 0.2s;
}

.limit-info {
  font-size: var(--font-size-base);
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

.sub-text {
  margin-top: 4px;
  letter-spacing: 0.05em;
}

.clear-button {
  margin-top: 1.5rem;
  line-height: 1.6;
  text-decoration: underline;
  cursor: pointer;
}

/* スマートフォン向けのレスポンシブ設定 */
@media (max-width: 768px) {
  .pc-only {
    display: none;
  }
  .mobile-only {
    display: block;
  }

  .sub-info {
    /* 横並びから縦並びに変更 */
    flex-direction: column;
    gap: 4px; /* 縦の間隔を調整 */
  }

  .sub-info .separator {
    /* 縦積みの時は不要なので非表示にする */
    display: none;
  }
}
</style>
