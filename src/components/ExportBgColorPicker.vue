<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore"; // パスは環境に合わせて調整してください

const props = defineProps({
  previewUrl: {
    type: String,
    required: true,
  },
});

const store = useImagesStore();

// ストアから現在の設定（個別 or グローバル）を取得
const exportSettings = computed(() =>
  store.getExportSettings(props.previewUrl),
);

// 背景色が変更された時のハンドラ
const handleColorChange = (event) => {
  store.setIndividualExportSettings(props.previewUrl, {
    backgroundColor: event.target.value,
  });
};
</script>

<template>
  <div class="input-group">
    <label :for="'bg-color-' + previewUrl">背景色:</label>
    <div class="color-picker-wrapper">
      <input
        type="color"
        :id="'bg-color-' + previewUrl"
        :value="exportSettings.backgroundColor || '#ffffff'"
        @input="handleColorChange"
        class="color-input"
      />
      <span class="color-code">{{
        exportSettings.backgroundColor || "#ffffff"
      }}</span>
    </div>
  </div>
</template>

<style scoped>
.color-picker-wrapper {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* ブラウザ標準のカラーピッカーの外観を整える */
.color-input {
  width: 32px;
  height: 32px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  background: none;
}

/* Chrome/SafariなどのWebkit系ブラウザ用スタイル */
.color-input::-webkit-color-swatch-wrapper {
  padding: 0;
}
.color-input::-webkit-color-swatch {
  border: none;
  border-radius: 3px;
}

.color-code {
  font-family: monospace;
  font-size: 12px;
  color: #666;
  text-transform: uppercase;
}
</style>
