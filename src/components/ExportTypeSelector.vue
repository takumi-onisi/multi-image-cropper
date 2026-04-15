<script setup>
import { useImagesStore } from "../stores/imagesStore";
import { EXPORT_TYPE_OPTIONS, EXPORT_TYPES } from "../constants/exportTypes";

const props = defineProps({
  file: { type: Object, default: null },
});

const imagesStore = useImagesStore();

// ストアから取得する
const getExportType = () => {
  const config = imagesStore.getExportSettings(props.file.previewUrl);
  return config?.exportType || EXPORT_TYPES.PNG;
};

// 値の更新
const handleUpdate = (event) => {
  const newType = { exportType: event.target.value };
  imagesStore.updateExportSettings(props.file.previewUrl, newType);
};
</script>

<template>
  <select :value="getExportType()" @change="handleUpdate">
    <option
      v-for="option in EXPORT_TYPE_OPTIONS"
      :key="option.value"
      :value="option.value"
    >
      {{ option.label }}
    </option>
  </select>
</template>
