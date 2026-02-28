import { defineStore } from "pinia";
import { ref } from "vue";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);
  const globalConfig = ref({
    selection: { x: 0, y: 0, width: 0, height: 0 },
    transform: [1, 0, 0, 1, 0, 0],
    aspectRatio: null,
    format: "png",
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

  const setGlobalConfig = (config) => {
    const newSelection = { ...config.selection };
    const newTransform = [...config.transform];

    // グローバル設定(マスター)を更新
    globalConfig.value.selection = newSelection;
    globalConfig.value.transform = newTransform;

    // 画像それぞれに切り抜き用の設定を持たせる
    fileList.value.forEach((file) => {
      // 1つのファイルの切り抜き設定を編集しても他のファイルに影響が出ないようにする。
      file.cropConfig = {
        selection: { ...newSelection },
        transform: [...newTransform],
        isModified: false,
      };
    });
  };

  return {
    fileList,
    addFiles,
    clearFiles,
    setGlobalConfig,
  };
});
