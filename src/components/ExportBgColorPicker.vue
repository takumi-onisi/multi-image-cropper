<script setup>
import { computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";

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

// カラーピッカーの値が変更された際の処理
const handleColorChange = (event) => {
  const newColor = event.target.value;
  const settings = { backgroundColor: newColor };

  store.updateExportSettings(props.previewUrl, settings);
};
</script>

<template>
  <div class="input-group">
    <label for="bg-color-picker">背景色:</label>
    <div class="color-picker-wrapper">
      <input
        type="color"
        id="bg-color-picker"
        :value="exportSettings.backgroundColor || '#ffffff'"
        @input="handleColorChange"
        class="color-input"
      />
    </div>
  </div>
</template>

<style scoped>
.input-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.color-input {
  width: 28px;
  height: 28px;
  padding: 0;
  border: 1px solid #ccc;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  top: 2px;
}
</style>
