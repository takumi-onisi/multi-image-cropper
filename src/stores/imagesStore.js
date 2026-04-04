import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { assertCropConfig } from "../utils/assertions";
import {
  GLOBAL_PREVIEW_ID,
  DEFAULT_CROP_CONFIG,
} from "../constants/cropConfig";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);
  const globalConfig = ref(createCropConfig());
  // 個別設定の一時的な保持に使用
  const individualCropConfig = ref(createCropConfig());
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

    if (fileList.value.length === 0) {
      const first = newEntries[0];
      // グローバル設定用のオブジェクト専用のオブジェクトを作成する
      const globalPreview = {
        ...first,
        id: GLOBAL_PREVIEW_ID,
        // 同じFileオブジェクトから別のURLを発行することで、
        // 「同じ画像だが別個体」としてストアに認識させる
        previewUrl: URL.createObjectURL(first.file),
        isGlobalMaster: true,
      };
      fileList.value = [globalPreview, ...newEntries];
    } else {
      // 既存のリストの後ろに追加
      fileList.value = [...fileList.value, ...newEntries];
    }
  };

  const clearFiles = () => {
    // メモリーリーク防止のために、生成したURLを解放してからクリア
    fileList.value.forEach((item) => URL.revokeObjectURL(item.previewUrl)); // URLの開放
    fileList.value = []; // ファイルリストをクリア
  };

  // ユーザーに表示するリスト（グローバルマスターを除外）
  const displayFileList = computed(() => {
    return fileList.value.filter((file) => file.id !== GLOBAL_PREVIEW_ID);
  });

  // グローバル設定画面で使うための専用ファイルを取得
  const globalPreviewFile = computed(() => {
    return fileList.value.find((file) => file.id === GLOBAL_PREVIEW_ID);
  });

  // ユーザーに見せる切り抜き対象の画像枚数を返す
  const totalImageCount = computed(() => {
    return displayFileList.value.length;
  });

  // 渡された画像の切り抜き設定を返す
  const getFileCropConfig = computed(() => (previewUrl) => {
    // 個別切り抜き設定中の時
    if (previewUrl === activePreviewUrl.value) {
      return createCropConfig(individualCropConfig.value);
    }

    // グローバル切り抜き設定中もしくは画像書き出し中の時
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    const targetConfig = file?.cropConfig || globalConfig.value;

    return createCropConfig(targetConfig);
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

    // グローバル設定(マスター)を更新
    Object.assign(
      globalConfig.value,
      createCropConfig({
        ...config,
      }),
    );
  };

  const setIndividualCropConfig = (previewUrl, config) => {
    // 渡されたconfigが必要な要件を満たしていることを確認
    assertCropConfig(config);

    if (previewUrl !== activePreviewUrl.value) return;

    // 個別設定の値を更新
    Object.assign(
      individualCropConfig.value,
      createCropConfig({
        ...config,
      }),
    );
  };

  // 個別設定用のメソッド
  const setFileConfig = (previewUrl, config) => {
    // 1. バリデーション（テストでチェックすべき項目）
    if (!assertCropConfig(config)) return;

    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    if (!file) return;

    // 個別設定がまだない場合は初期化（ここだけは新規作成）
    if (!file.cropConfig) {
      file.cropConfig = createCropConfig();
    }

    // 【重要】参照を維持したまま、中身の数値だけを同期する
    // これにより、Vueの「深い監視」が暴走するのを防ぎます
    Object.assign(
      file.cropConfig,
      createCropConfig({
        ...file.cropConfig,
        ...config,
      }),
    );
  };

  // 個別切り抜き設定の値を保存
  const commitIndividualEdit = (previewUrl) => {
    if (previewUrl !== activePreviewUrl.value) return;

    const file = fileList.value.find(
      (f) => f.previewUrl === activePreviewUrl.value,
    );

    if (file) {
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
      individualCropConfig.value = createCropConfig(globalConfig.value);
    }
  };

  const clearActiveCropConfig = () => {
    activePreviewUrl.value = null;
    // 初期値（globalConfigの内容）をセット
    individualCropConfig.value = createCropConfig(globalConfig.value);
  };

  const clearFileCropConfig = (previewUrl) => {
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);

    // プロパティごと破棄
    if (file?.cropConfig) {
      file.cropConfig = null;
    }
  };

  function createCropConfig(base = {}) {
    return {
      ...DEFAULT_CROP_CONFIG,
      ...base,
      targetSize: {
        ...DEFAULT_CROP_CONFIG.targetSize,
        ...base.targetSize,
      },
      selection: {
        ...DEFAULT_CROP_CONFIG.selection,
        ...base.selection,
      },
      transform: base.transform
        ? [...base.transform]
        : [...DEFAULT_CROP_CONFIG.transform],
    };
  }

  return {
    fileList,
    addFiles,
    clearFiles,
    displayFileList,
    globalPreviewFile,
    totalImageCount,
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
