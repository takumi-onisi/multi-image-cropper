<script setup>
import { ref, watch, nextTick, toRaw } from "vue";

const props = defineProps({
  config: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(["update:config"]);

// 親からの値を受けて、ローカルで扱うためのリアクティブデータ
const localConfig = ref(structuredClone(props.config));
// プロパティの更新がループしてしまうことを防ぐ
let isInternalSync = false; // 操作中フラグ (ユーザーが直接プロパティを操作している時は親からの更新を受け付けない)

// 親の値が変わった時に、ローカル値を更新する
watch(
  () => props.config,
  (newVal) => {
    if (isInternalSync) return; // ユーザーが入力中のときは何もしない
    localConfig.value = structuredClone(newVal);
  },
  { deep: true },
);

// 入力イベント：親へ変更を通知
const onUpdate = () => {
  isInternalSync = true; // 反映を停止する
  const rawData = toRaw(localConfig.value);
  const clonedData = structuredClone(rawData);
  emit("update:config", clonedData);

  // ユーザー入力が終わったタイミングでフラグを戻す
  nextTick(() => {
    isInternalSync = false;
  });
};
</script>

<template>
  <div class="property-bar">
    <div class="input-group">
      <label>X:</label>
      <input
        type="number"
        v-model.number="localConfig.selection.x"
        @input="onUpdate"
      />
    </div>
    <div class="input-group">
      <label>Y:</label>
      <input
        type="number"
        v-model.number="localConfig.selection.y"
        @input="onUpdate"
      />
    </div>
    <div class="input-group">
      <label>幅:</label>
      <input
        type="number"
        v-model.number="localConfig.selection.width"
        @input="onUpdate"
      />
    </div>
    <div class="input-group">
      <label>高さ:</label>
      <input
        type="number"
        v-model.number="localConfig.selection.height"
        @input="onUpdate"
      />
    </div>
  </div>
</template>

<style scoped>
.property-bar {
  display: flex;
  gap: 10px;
  padding: 10px;
  background: #f4f4f4;
  border-radius: 4px;
}
.input-group {
  display: flex;
  flex-direction: column;
}
</style>
