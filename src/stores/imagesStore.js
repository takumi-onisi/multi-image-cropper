import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { assertCropConfig } from "../utils/assertions";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);
  const globalConfig = ref({
    selection: { x: 0, y: 0, width: 0, height: 0 },
    transform: [1, 0, 0, 1, 0, 0],
  });

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
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    const targetConfig = file?.cropConfig || globalConfig.value;

    return {
      selection: { ...targetConfig.selection },
      transform: [...targetConfig.transform],
    };
  });

  // グローバル設定のコピーを返す。(読み取り専用)
  const getGlobalConfig = computed(() => ({ ...globalConfig.value }));

  const setGlobalConfig = (config) => {
    // 渡されたconfigが必要な要件を満たしていることを確認
    assertCropConfig(config);

    const newSelection = { ...config.selection };
    const newTransform = [...config.transform];

    // グローバル設定(マスター)を更新
    globalConfig.value.selection = newSelection;
    globalConfig.value.transform = newTransform;
  };

  // 個別設定用のメソッド
  const setFileConfig = (previewUrl, config) => {
    // 1. バリデーション（テストでチェックすべき項目）
    if (!assertCropConfig(config)) return;

    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    if (file) {
      file.cropConfig = {
        selection: { ...config.selection },
        transform: [...config.transform],
      };
    }
  };

  return {
    fileList,
    addFiles,
    clearFiles,
    getFileCropConfig,
    getGlobalConfig,
    setGlobalConfig,
    setFileConfig,
  };
});
