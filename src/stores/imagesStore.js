import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { assertCropConfig } from "../utils/assertions";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);
  const globalConfig = ref({
    selection: { x: 0, y: 0, width: 0, height: 0 },
    transform: [1, 0, 0, 1, 0, 0],
  });
  // 個別設定の一時的な保持に使用
  const individualCropConfig = ref({
    selection: { x: 0, y: 0, width: 0, height: 0 },
    transform: [1, 0, 0, 1, 0, 0],
  });
  // individualCropConfigの対象となるファイルを識別するために使用
  const activePreviewUrl = ref(null);

  // 個別切り抜き設定のモードの状態を保持
  const isIndividualMode = ref(false);
  // モード切り替え用のシンプルな関数
  const setIndividualMode = (value) => {
    isIndividualMode.value = value;
  };

  const addFiles = (files) => {
    // files は FileList という特殊な型なので、Array.fromで配列化が必要
    const newEntries = Array.from(files).map((file) => {
      return {
        id: crypto.randomUUID(), // v-for用のkey
        file: file, // 生のファイルデータ
        name: file.name,
        // ファイルにアクセスできるようにブラウザのメモリにファイルへのURLを発行する
        // ブラウザのメモリリーク防止のためにメモリのクリアも作成すること
        previewUrl: URL.createObjectURL(file),
      };
    });

    // 既存のリストの後ろに追加
    fileList.value = [...fileList.value, ...newEntries];
  };

  const clearFiles = () => {
    // メモリーリーク防止のために、生成したURLを解放してからクリア
    fileList.value.forEach((item) => URL.revokeObjectURL(item.previewUrl)); // URLの開放
    fileList.value = []; // ファイルリストをクリア
  };

  // 渡された画像の切り抜き設定を返す
  const getFileCropConfig = computed(() => (previewUrl) => {
    // 個別切り抜き設定中の時
    if (previewUrl === activePreviewUrl.value) {
      return {
        selection: { ...individualCropConfig.value.selection },
        transform: [...individualCropConfig.value.transform],
      };
    }

    // グローバル切り抜き設定中もしくは画像書き出し中の時
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    const targetConfig = file?.cropConfig || globalConfig.value;

    return {
      selection: { ...targetConfig.selection },
      transform: [...targetConfig.transform],
    };
  });

  // グローバル設定のコピーを返す。(読み取り専用)
  const getGlobalConfig = computed(() => ({ ...globalConfig.value }));

  const updatePreviewConfig = (previewUrl, config) => {
    if (isIndividualMode.value) {
      setIndividualCropConfig(previewUrl, config);
    } else {
      setGlobalConfig(config);
    }
  };

  const setGlobalConfig = (config) => {
    // 渡されたconfigが必要な要件を満たしていることを確認
    assertCropConfig(config);

    const newSelection = { ...config.selection };
    const newTransform = [...config.transform];

    // グローバル設定(マスター)を更新
    globalConfig.value.selection = newSelection;
    globalConfig.value.transform = newTransform;
  };

  const setIndividualCropConfig = (previewUrl, config) => {
    // 渡されたconfigが必要な要件を満たしていることを確認
    assertCropConfig(config);

    if (previewUrl !== activePreviewUrl.value) return;

    const newSelection = { ...config.selection };
    const newTransform = [...config.transform];

    // 個別設定の値を更新
    individualCropConfig.value.selection = newSelection;
    individualCropConfig.value.transform = newTransform;
  };

  // 個別設定用のメソッド
  const setFileConfig = (previewUrl, config) => {
    // 1. バリデーション（テストでチェックすべき項目）
    if (!assertCropConfig(config)) return;

    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    if (!file) return;

    // 個別設定がまだない場合は初期化（ここだけは新規作成）
    if (!file.cropConfig) {
      file.cropConfig = {
        selection: { x: 0, y: 0, width: 0, height: 0 },
        transform: [1, 0, 0, 1, 0, 0],
      };
    }

    // 【重要】参照を維持したまま、中身の数値だけを同期する
    // これにより、Vueの「深い監視」が暴走するのを防ぎます
    if (config.selection) {
      Object.assign(file.cropConfig.selection, {
        x: config.selection.x,
        y: config.selection.y,
        width: config.selection.width,
        height: config.selection.height,
      });
    }

    if (config.transform) {
      // 配列も中身だけ入れ替える
      file.cropConfig.transform.splice(
        0,
        file.cropConfig.transform.length,
        ...config.transform,
      );
    }
  };

  // 個別切り抜き設定の値を保存
  const commitIndividualEdit = (previewUrl) => {
    if (previewUrl !== activePreviewUrl.value) return;

    const file = fileList.value.find(
      (f) => f.previewUrl === activePreviewUrl.value,
    );

    if (file) {
      console.log(activePreviewUrl.value);
      // 保存
      file.cropConfig = JSON.parse(JSON.stringify(individualCropConfig.value));
      // 値をクリア
      clearActiveCropConfig();
    }
  };

  const prepareIndividualEdit = (previewUrl) => {
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    activePreviewUrl.value = previewUrl;

    // 現在の値をコピーして「編集用」に入れる
    if (file?.cropConfig) {
      individualCropConfig.value = JSON.parse(JSON.stringify(file.cropConfig));
    } else {
      // 初期値（globalConfigの内容）をセット
      individualCropConfig.value = JSON.parse(
        JSON.stringify(globalConfig.value),
      );
    }
  };

  const clearActiveCropConfig = () => {
    activePreviewUrl.value = null;
    // 初期値（globalConfigの内容）をセット
    individualCropConfig.value = JSON.parse(JSON.stringify(globalConfig.value));
  };

  const clearFileCropConfig = (previewUrl) => {
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);

    // プロパティごと破棄
    if (file?.cropConfig) {
      file.cropConfig = null;
    }
  };

  return {
    fileList,
    addFiles,
    clearFiles,
    isIndividualMode,
    setIndividualMode,
    updatePreviewConfig,
    getFileCropConfig,
    getGlobalConfig,
    setGlobalConfig,
    setFileConfig,
    commitIndividualEdit,
    prepareIndividualEdit,
    clearActiveCropConfig,
    clearFileCropConfig,
  };
});
