<script setup>
const props = defineProps({
  // 現在設定されている色（親から受け取る）
  modelValue: {
    type: String,
    default: "#ffffff",
  },
});

const emit = defineEmits(["update:modelValue"]);

const handleInput = (event) => {
  emit("update:modelValue", event.target.value);
};
</script>

<template>
  <div class="input-group">
    <label>背景色:</label>
    <div class="color-picker-wrapper">
      <input
        type="color"
        :value="modelValue"
        @input="handleInput"
        class="color-input"
      />
      <span class="color-code">{{ modelValue }}</span>
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
