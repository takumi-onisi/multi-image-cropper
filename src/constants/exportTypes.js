export const EXPORT_TYPES = {
  PNG: "image/png",
  JPEG: "image/jpeg",
};

// 選択肢として使うための配列（プルダウン作成時に便利）
export const EXPORT_TYPE_OPTIONS = [
  { label: "PNG (.png)", value: EXPORT_TYPES.PNG },
  { label: "JPEG (.jpg)", value: EXPORT_TYPES.JPEG },
];

const EXTENSIONS = {
  [EXPORT_TYPES.PNG]: "png",
  [EXPORT_TYPES.JPEG]: "jpg",
};

/**
 * MIMEタイプに対応する拡張子を取得する
 * @param {string} type
 * @returns {string} 拡張子（デフォルトはpng）
 */
export const getExtensionByType = (type) => {
  return EXTENSIONS[type] || "png";
};
