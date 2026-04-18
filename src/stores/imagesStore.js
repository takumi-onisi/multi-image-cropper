import { defineStore } from "pinia";
import { ref, computed } from "vue";
import { assertCropConfig } from "../utils/assertions";
import {
  GLOBAL_PREVIEW_ID,
  DEFAULT_CROP_CONFIG,
} from "../constants/cropConfig";
import { DEFAULT_EXPORT_SETTINGS } from "../constants/exportSettings";
import {
  MAX_FILE_COUNT,
  MAX_SINGLE_FILE_SIZE,
  MAX_TOTAL_FILE_SIZE,
} from "../constants/config";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);
  const globalConfig = ref(createCropConfig());
  const globalExportSettings = ref(createExportSettings());
  // 個別設定の一時的な保持に使用
  const individualCropConfig = ref(createCropConfig());
  const individualExportSettings = ref(createExportSettings());
  // individualCropConfigの対象となるファイルを識別するために使用
  const activePreviewUrl = ref(null);

  // 個別切り抜き設定のモードの状態を保持
  const isIndividualMode = ref(false);
  // モード切り替え用のシンプルな関数
  const setIndividualMode = (value) => {
    isIndividualMode.value = value;
  };

  const addFiles = (files) => {
    const fileArray = Array.from(files);

    // 1. 重複を排除 (既存リストとの比較 + 選択された中での重複排除)
    const existingKeys = new Set(
      fileList.value.map((item) => getFileKey(item.file)),
    );
    const uniqueFiles = fileArray.filter((file) => {
      const key = getFileKey(file);
      if (existingKeys.has(key)) return false;
      existingKeys.add(key); // 今回の選択内での重複も防ぐ
      return true;
    });

    if (uniqueFiles.length === 0) return;

    // 2. バリデーション実行
    const { accepted, errors } = partitionFiles(
      uniqueFiles,
      displayFileList.value.length,
      fileList.value.reduce((sum, item) => sum + item.file.size, 0),
    );

    // 3. エラーがあれば通知
    if (errors.length > 0) {
      alert(`一部のファイルを追加できませんでした:\n\n${errors.join("\n")}`);
    }

    if (accepted.length === 0) return;

    // 3. データ形式への変換
    const newEntries = accepted.map(createFileEntry);

    // 4. リストへの追加とグローバルマスターの初期化
    if (fileList.value.length === 0) {
      const globalMaster = createGlobalMaster(newEntries[0]);
      fileList.value = [globalMaster, ...newEntries];
    } else {
      fileList.value = [...fileList.value, ...newEntries];
    }
  };

  /**
   * 重複チェック用の簡易キー生成
   */
  const getFileKey = (file) => `${file.name}-${file.size}-${file.lastModified}`;

  /**
   * ファイル群をバリデーションし、合格したものとエラー内容を振り分ける
   */
  const partitionFiles = (files, initialCount, initialTotalSize) => {
    const accepted = [];
    const errors = [];
    let currentCount = initialCount;
    let currentTotalSize = initialTotalSize;

    for (const file of files) {
      // 1. 枚数チェック
      if (currentCount >= MAX_FILE_COUNT) {
        errors.push(
          `${file.name}: 最大枚数(${MAX_FILE_COUNT}枚)を超えています。`,
        );
        continue;
      }

      // 2. 個別サイズチェック
      if (file.size > MAX_SINGLE_FILE_SIZE) {
        errors.push(`${file.name}: 1枚あたりの制限(10MB)を超えています。`);
        continue;
      }

      // 3. 合計サイズチェック
      if (currentTotalSize + file.size > MAX_TOTAL_FILE_SIZE) {
        errors.push(`${file.name}: 合計容量制限を超えるため追加できません。`);
        continue;
      }

      // すべて合格
      accepted.push(file);
      currentCount++;
      currentTotalSize += file.size;
    }

    return { accepted, errors };
  };

  /**
   * 単一のファイルエントリーオブジェクトを作成
   */
  const createFileEntry = (file) => ({
    id: crypto.randomUUID(),
    file: file,
    name: file.name,
    // ファイルにアクセスできるようにブラウザのメモリにファイルへのURLを発行する
    previewUrl: URL.createObjectURL(file),
  });

  /**
   * グローバルマスター用のエントリーを作成
   */
  const createGlobalMaster = (entry) => ({
    ...entry,
    id: GLOBAL_PREVIEW_ID,
    // 同じFileオブジェクトから別のURLを発行することで、
    // 「同じ画像だが別個体」としてストアに認識させる
    previewUrl: URL.createObjectURL(entry.file),
    isGlobalMaster: true,
  });

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

  // 渡された画像の書き出し設定を返す
  const getExportSettings = computed(() => (previewUrl) => {
    // 個別切り抜き設定中の時
    if (previewUrl === activePreviewUrl.value) {
      return { ...individualExportSettings.value };
    }

    // グローバル切り抜き設定中もしくは画像書き出し中の時
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    const targetSettig = file?.exportSettings ?? globalExportSettings.value;
    return createExportSettings(targetSettig);
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
        ...globalConfig.value,
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
        ...individualCropConfig.value,
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

  const updateExportSettings = (previewUrl, newSettings) => {
    if (isIndividualMode.value) {
      setIndividualExportSettings(previewUrl, newSettings);
    } else {
      setGlobalExportSettings(newSettings);
    }
  };

  const setGlobalExportSettings = (settings) => {
    Object.assign(
      globalExportSettings.value,
      createExportSettings({
        ...globalExportSettings.value,
        ...settings,
      }),
    );
  };

  const setIndividualExportSettings = (previewUrl, settings) => {
    if (previewUrl !== activePreviewUrl.value) return;

    Object.assign(
      individualExportSettings.value,
      createExportSettings({
        ...individualExportSettings.value,
        ...settings,
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
      file.exportSettings = JSON.parse(
        JSON.stringify(individualExportSettings.value),
      );
      // 値をクリア
      resetIndividualEditState();
    }
  };

  const prepareIndividualEdit = (previewUrl) => {
    const file = fileList.value.find((f) => f.previewUrl === previewUrl);
    activePreviewUrl.value = previewUrl;

    // 現在の値をコピーして「編集用」に入れる
    if (file?.cropConfig) {
      individualCropConfig.value = JSON.parse(JSON.stringify(file.cropConfig));
      individualExportSettings.value = JSON.parse(
        JSON.stringify(file.exportSettings),
      );
    } else {
      // 初期値（globalConfigの内容）をセット
      individualCropConfig.value = createCropConfig(globalConfig.value);
      individualExportSettings.value = JSON.parse(
        JSON.stringify(globalExportSettings.value),
      );
    }
  };

  const resetIndividualEditState = () => {
    activePreviewUrl.value = null;
    // 初期値（globalConfigの内容）をセット
    individualCropConfig.value = createCropConfig(globalConfig.value);
    individualExportSettings.value = createExportSettings(globalExportSettings);
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
      ratio: {
        ...DEFAULT_CROP_CONFIG.ratio,
        ...base.ratio,
      },
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

  function createExportSettings(base = {}) {
    return {
      ...DEFAULT_EXPORT_SETTINGS,
      ...base,
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
    getExportSettings,
    setGlobalConfig,
    setFileConfig,
    updateExportSettings,
    commitIndividualEdit,
    prepareIndividualEdit,
    resetIndividualEditState,
    clearFileCropConfig,
  };
});
