<script setup>
import { ref, watch, nextTick, toRaw, computed } from "vue";
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
let isUpdatePending = false; // 予約フラグ (コンポーネント内のリアクティブの一連の変更を待って最終的な値をイベントアップするためのフラグ)

// プロパティバーの縦横比を保持
const aspectRatio = ref({
  width: null,
  height: null,
});
// 縦横比の値を固定するかどうか
let isRatioFixed = ref(true);

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
  // nextTickで更新が終わるまでは新しくイベントアップしない
  if (isSyncingFromStore || isUpdatePending) return;

  // --- ここから送信処理 ---
  isChangingByUI = true; // ロックをかける
  isUpdatePending = true; // 更新を予約する
  nextTick(() => {
    emit("update:config", structuredClone(toRaw(localConfig.value)));
    // ストア経由で props が戻ってくるまでの時間を考慮して nextTick で解除
    isChangingByUI = false; // ロックを解除
    isUpdatePending = false; // 予約解除
  });
};

// 座標やサイズなど、直接的な値の変更を監視
watch(
  () => localConfig.value,
  () => {
    emitUpdate();
  },
  { deep: true },
);

// プルダウンに表示するための「見た目上のモード」
const displayMode = computed({
  get() {
    // 内部が FREE または RATIO のときは、プルダウンでは「比率」に見せる
    if (
      localConfig.value.mode === CROP_MODES.FREE ||
      localConfig.value.mode === CROP_MODES.RATIO
    ) {
      return "RATIO_GROUP";
    }
    return localConfig.value.mode;
  },
  set(val) {
    // プルダウンで「比率」が選ばれたら、とりあえず FREE にしておく
    // その後、チェックボックスの watch ロジックが RATIO にすべきか判断する
    if (val === "RATIO_GROUP") {
      localConfig.value.mode = CROP_MODES.FREE;
    } else {
      localConfig.value.mode = val;
    }
  },
});

const displaySelection = computed(() => {
  const { selection, targetSize, mode } = localConfig.value;

  // 自由モードならそのままの値を返す
  if (mode !== CROP_MODES.FIXED_SIZE) {
    return selection;
  }

  // 固定サイズモード時のスケール計算 (target / selection_view)
  // セレクションの枠が「出力サイズに対してどの位置にあるか」
  // 0除算を防ぐため || 1 を入れている
  const scale = targetSize.width / (selection.width || 1);

  return {
    x: Math.round(selection.x * scale),
    y: Math.round(selection.y * scale),
    width: targetSize.width,
    height: targetSize.height,
  };
});

// displaySelection用の共通の逆計算ロジック
const updateCoord = (key, value) => {
  if (localConfig.value.mode !== CROP_MODES.FIXED_SIZE) {
    localConfig.value.selection[key] = value;
  } else {
    // スケールを計算して逆算
    const scale =
      localConfig.value.targetSize.width /
      (localConfig.value.selection.width || 1);
    localConfig.value.selection[key] = value / scale;
  }
  // emitUpdateは watch(localConfig) が検知して行うのでここでは不要
};

// v-model 用の個別 computed
const inputX = computed({
  get: () => displaySelection.value.x,
  set: (val) => updateCoord("x", val),
});

// v-model 用の個別 computed
const inputY = computed({
  get: () => displaySelection.value.y,
  set: (val) => updateCoord("y", val),
});

// アスペクト比の計算とモードの連動
watch(
  [
    () => localConfig.value.mode,
    () => isRatioFixed.value,
    () => aspectRatio.value.width,
    () => aspectRatio.value.height,
    () => localConfig.value.targetSize.width,
    () => localConfig.value.targetSize.height,
  ],
  ([mode, fixed, ratioW, ratioH, targetW, targetH]) => {
    if (isSyncingFromStore) return;

    let nextMode = mode; // 現在のモードを保持
    let targetRatio = null;

    // 縦横比の計算
    if (mode === CROP_MODES.FIXED_SIZE) {
      // --- FIXED_SIZE モード：現在のセレクションサイズから比率を固定 ---
      if (targetW > 0 && targetH > 0) {
        targetRatio = targetW / targetH;
      }
    } else {
      // 比率グループ内での切り替えロジック
      const hasBothValues = ratioW > 0 && ratioH > 0;
      if (hasBothValues && fixed) {
        // 「比率を固定」が選択されている
        nextMode = CROP_MODES.RATIO;
        targetRatio = ratioW / ratioH;
      } else {
        nextMode = CROP_MODES.FREE;
        targetRatio = null;
      }
    }

    // モードまたは比率が変わった場合のみ更新
    if (
      localConfig.value.mode !== nextMode ||
      localConfig.value.aspectRatio !== targetRatio
    ) {
      localConfig.value.mode = nextMode;
      localConfig.value.aspectRatio = targetRatio; // aspectRatio を更新
    }
  },
);
</script>

<template>
  <div class="property-bar">
    <div class="input-group">
      <select v-model="displayMode">
        <option value="RATIO_GROUP">比率</option>
        <option :value="CROP_MODES.FIXED_SIZE">幅 × 高さ × 解像度</option>
      </select>
    </div>

    <div v-if="displayMode === 'RATIO_GROUP'" class="input-group-container">
      <div class="input-group">
        <label>幅 :</label>
        <input type="number" v-model.number="aspectRatio.width" />
      </div>
      <div class="input-group">
        <label>高さ :</label>
        <input type="number" v-model.number="aspectRatio.height" />
      </div>
      <div class="input-group">
        <input type="checkbox" v-model="isRatioFixed" id="fix-ratio" />
        <label for="fix-ratio">縦横比を固定</label>
      </div>
    </div>

    <div
      v-else-if="displayMode === CROP_MODES.FIXED_SIZE"
      class="input-group-container"
    >
      <div class="input-group">
        <label>幅 :</label>
        <input type="number" v-model.number="localConfig.targetSize.width" />
      </div>
      <div class="input-group">
        <label>高さ :</label>
        <input type="number" v-model.number="localConfig.targetSize.height" />
      </div>
      <div class="input-group">
        <label>解像度 :</label>
        <input type="number" v-model.number="localConfig.resolution" />
      </div>
    </div>

    <div class="divider"></div>

    <div class="input-group">
      <label>X :</label>
      <input type="number" v-model.number="inputX" />
      <span class="unit">px</span>
    </div>
    <div class="input-group">
      <label>Y :</label>
      <input type="number" v-model.number="inputY" />
      <span class="unit">px</span>
    </div>

    <div class="input-group">
      <label>幅 :</label>
      <input
        type="number"
        v-model.number="displaySelection.width"
        :disabled="displayMode === CROP_MODES.FIXED_SIZE"
      />
      <span class="unit">px</span>
    </div>
    <div class="input-group">
      <label>高さ :</label>
      <input
        type="number"
        v-model.number="displaySelection.height"
        :disabled="displayMode === CROP_MODES.FIXED_SIZE"
      />
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

.ratio_group,
.input-group-container {
  display: flex;
  align-items: center;
  gap: 12px; /* グループ内の要素間隔 */
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

input:disabled {
  background-color: #eee;
  color: #888;
  border-color: #ddd;
  cursor: not-allowed;
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
