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

// プロパティバーの縦横比を保持
const aspectRatio = ref({
  width: null,
  height: null,
});
// 縦横比の値を固定するかどうか
let isRatioFixed = ref(false);

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
const emitUpdate = () => {
  // もし「親からの更新」によってここが動いた場合は、再送(emit)しない
  if (isSyncingFromStore) return;

  // --- ここから送信処理 ---
  isChangingByUI = true; // ロックをかける
  emit("update:config", structuredClone(toRaw(localConfig.value)));
  nextTick(() => {
    // ストア経由で props が戻ってくるまでの時間を考慮して nextTick で解除
    isChangingByUI = false; // ロックを解除
  });
};

// 座標やサイズなど、直接的な値の変更を監視
watch(
  [
    () => localConfig.value.selection.x,
    () => localConfig.value.selection.y,
    () => localConfig.value.selection.width,
    () => localConfig.value.selection.height,
    () => localConfig.value.mode,
  ],
  () => {
    emitUpdate();
  },
);

// アスペクト比の計算とモードの連動
watch(
  [
    () => localConfig.value.mode,
    () => isRatioFixed.value,
    () => aspectRatio.value.width,
    () => aspectRatio.value.height,
    () => localConfig.value.selection.width,
    () => localConfig.value.selection.height,
  ],
  ([mode, fixed, ratioW, ratioH, selectW, selectH]) => {
    if (isSyncingFromStore) return;

    let targetRatio = null;

    // 縦横比の計算
    if (mode === CROP_MODES.FIXED_SIZE) {
      // --- FIXED_SIZE モード：現在のセレクションサイズから比率を固定 ---
      if (selectW > 0 && selectH > 0) {
        targetRatio = selectW / selectH;
      }
    } else {
      // --- FREE (RATIO) モード：専用入力欄とチェックボックスを参照 ---
      const hasBothValues = ratioW > 0 && ratioH > 0;
      if (hasBothValues && fixed) {
        // 比率を固定が選択されているかチェック
        targetRatio = ratioW / ratioH;
      }
    }

    // ストア側の aspectRatio を更新（変更があれば emitUpdate が走る）
    if (localConfig.value.aspectRatio !== targetRatio) {
      localConfig.value.aspectRatio = targetRatio;
      emitUpdate();
    }
  },
);
</script>

<template>
  <div class="property-bar">
    <div class="input-group">
      <select v-model="localConfig.mode">
        <option :value="CROP_MODES.FREE" selected>比率(自由/固定)</option>
        <option :value="CROP_MODES.FIXED_SIZE">幅 × 高さ × 解像度</option>
      </select>
    </div>
    <div
      v-if="
        localConfig.mode === CROP_MODES.FREE ||
        localConfig.mode === CROP_MODES.RATIO
      "
      class="input-group"
    >
      <label>幅 :</label>
      <input type="number" v-model.number="aspectRatio.width" />
    </div>
    <div
      v-if="
        localConfig.mode === CROP_MODES.FREE ||
        localConfig.mode === CROP_MODES.RATIO
      "
      class="input-group"
    >
      <label>高さ :</label>
      <input type="number" v-model.number="aspectRatio.height" />
    </div>
    <div
      v-if="
        localConfig.mode === CROP_MODES.FREE ||
        localConfig.mode === CROP_MODES.RATIO
      "
      class="input-group"
    >
      <input type="checkbox" :value="isRatioFixed" />
      <label>縦横比を固定</label>
    </div>

    <div class="divider"></div>

    <div class="input-group">
      <label>X :</label>
      <input type="number" v-model.number="localConfig.selection.x" />
      <span class="unit">px</span>
    </div>
    <div class="input-group">
      <label>Y :</label>
      <input type="number" v-model.number="localConfig.selection.y" />
      <span class="unit">px</span>
    </div>
    <div class="input-group">
      <label>幅 :</label>
      <input type="number" v-model.number="localConfig.selection.width" />
      <span class="unit">px</span>
    </div>
    <div class="input-group">
      <label>高さ :</label>
      <input type="number" v-model.number="localConfig.selection.height" />
      <span class="unit">px</span>
    </div>
  </div>
</template>

<style scoped>
.property-bar {
  display: flex;
  flex-wrap: wrap; /* 折り返しを許可 */
  align-items: center;
  gap: 8px 16px; /* 横の隙間と、折り返した時の縦の隙間 */
  padding: 4px 12px;
  background: #f4f4f4;
  border-bottom: 1px solid #ccc;
  min-height: 40px; /* 高さを一定に保つ */
  font-size: 13px;
  color: #333;
}

.input-group {
  display: flex;
  align-items: center;
  gap: 4px;
  white-space: nowrap; /* ラベルの改行を防ぐ */
}

/* 入力欄のサイズを制限 */
.input-group input[type="number"] {
  width: 70px; /* 7桁程度が入る幅 */
  height: 24px; /* 高さを固定 */
  padding: 2px 4px;
  border: 1px solid #ccc;
  border-radius: 2px;
  background: #fff;
  font-family: monospace; /* 数字を見やすく */
}

/* 単位(px)のラベル */
.unit {
  font-size: 11px;
  color: #666;
  margin-left: -2px;
}

/* 区切り線：PCでは縦線、スマホ(狭い画面)では非表示にして改行を促す */
.divider {
  width: 1px;
  height: 20px;
  background-color: #ccc;
  margin: 0 4px;
}

/* レスポンシブ設定：画面幅が狭い時（例：800px以下） */
@media (max-width: 850px) {
  .divider {
    display: none; /* 区切り線を消す */
  }

  /* 2段に分けるためのダミー要素（dividerの代わりに挿入するイメージ） */
  /* もしくは divider の位置で強制改行させる場合 */
  .divider {
    display: block;
    width: 100%; /* 横幅いっぱいに広げて強制改行させる */
    height: 0;
    background: transparent;
    margin: 0;
  }
}
</style>
