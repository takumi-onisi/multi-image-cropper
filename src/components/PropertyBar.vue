<script setup>
import { ref, watch, nextTick, toRaw } from "vue";
import { CROP_MODES } from "../constants/cropModes";

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
let isChangingByUI = false; // 操作中フラグ (ユーザーが直接プロパティを操作している時は親からの更新を受け付けない)
let isSyncingFromStore = false; // ストア（親）からの変更を適用している最中か

// 親の値が変わった時に、ローカル値を更新する
watch(
  () => props.config,
  (newVal) => {
    if (isChangingByUI) return; // ユーザーが入力中のときは何もしない
    isSyncingFromStore = true; // 「ストアからの同期を開始」
    localConfig.value = structuredClone(newVal);

    nextTick(() => {
      isSyncingFromStore = false; // 同期終了
    });
  },
  { deep: true, immediate: true },
);

// 入力イベント：親へ変更を通知
watch(
  () => localConfig.value,
  (newVal) => {
    // もし「親からの更新」によってここが動いた場合は、再送(emit)しない
    if (isSyncingFromStore) return;

    // --- ここから送信処理 ---
    isChangingByUI = true; // ロックをかける

    const clonedData = structuredClone(toRaw(newVal));
    emit("update:config", clonedData);

    // ストア経由で props が戻ってくるまでの時間を考慮して nextTick で解除
    nextTick(() => {
      isChangingByUI = false; // ロックを解除
    });
  },
  { deep: true },
);
</script>

<template>
  <div class="property-bar">
    <div class="input-group">
      <select v-model="localConfig.mode">
        <option :value="CROP_MODES.RATIO">比率</option>
        <option :value="CROP_MODES.FIXED_SIZE">幅 × 高さ × 解像度</option>
      </select>
    </div>
    <div class="input-group">
      <label>X:</label>
      <input type="number" v-model.number="localConfig.selection.x" />
    </div>
    <div class="input-group">
      <label>Y:</label>
      <input type="number" v-model.number="localConfig.selection.y" />
    </div>
    <div class="input-group">
      <label>幅:</label>
      <input type="number" v-model.number="localConfig.selection.width" />
    </div>
    <div class="input-group">
      <label>高さ:</label>
      <input type="number" v-model.number="localConfig.selection.height" />
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
