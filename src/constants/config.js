/**
 * アプリケーション全体の制約に関する定数
 */

// 枚数制限
export const MAX_FILE_COUNT = 50;

// サイズ制限 (単位: Byte)
const MB = 1024 * 1024;
export const MAX_SINGLE_FILE_SIZE = 20 * MB;
export const MAX_TOTAL_FILE_SIZE = 300 * MB;

// 許可する拡張子/MIMEタイプ
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
];
