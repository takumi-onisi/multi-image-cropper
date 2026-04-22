import { loadImage } from "./imageLoader";
import { CROP_MODES } from "../constants/cropModes";
import { EXPORT_TYPES, getExtensionByType } from "../constants/exportTypes";
/**
 * 静的な画像URLからFileオブジェクトを生成するユーティリティ
 * チュートリアル画像やテンプレート画像の読み込みに使用します。
 * * @param {string} url - 取得先画像のURL（importしたアセットパスなど）
 * @param {string} fileName - 生成するFileオブジェクトに付与するファイル名
 * @returns {Promise<File>} 生成されたFileオブジェクトを返すプロミス
 * @throws {Error} ネットワークエラーやレスポンスの異常時にエラーを投げます
 */
export const fetchFileFromUrl = async (url, fileName) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(
        `画像の取得に失敗しました: ${response.status} ${response.statusText}`,
      );
    }
    const blob = await response.blob();

    // Fileオブジェクトを作成して返す
    // typeはblobから自動取得されるため、第二引数の名前と合わせて管理されます
    return new File([blob], fileName, { type: blob.type });
  } catch (error) {
    console.error("fetchFileFromUrlでエラーが発生しました:", error);
    throw error;
  }
};
/**
 * fileと設定から切り抜き済みCanvasを生成する
 * @param {object} file - ストアに保存された画像情報
 * @param {object} cropConfig - 切り抜き設定 {mode, selection, targetSize}
 * @returns {Promise<HTMLCanvasElement>} 切り抜かれたCanvas要素
 */
export async function performCropping(file, cropConfig) {
  const img = await loadImage(file.previewUrl); // 画像をロード
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // モード判定
  const isFixedSize = cropConfig.mode === CROP_MODES.FIXED_SIZE;

  // 1. Canvasのサイズ（出力サイズ）を決定
  if (isFixedSize && cropConfig.targetSize) {
    // 固定サイズモード：指定されたターゲットサイズにする
    canvas.width = cropConfig.targetSize.width;
    canvas.height = cropConfig.targetSize.height;
  } else {
    // 比率/自由モード：セレクションの大きさをそのまま使う
    canvas.width = cropConfig.selection.width;
    canvas.height = cropConfig.selection.height;
  }

  // 描画
  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  ctx.drawImage(
    img,
    cropConfig.selection.x, // sx: ソースの開始X
    cropConfig.selection.y, // sy: ソースの開始Y
    cropConfig.selection.width, // sWidth: ソースの幅
    cropConfig.selection.height, // sHeight: ソースの高さ
    0, // dx: Canvas内の描画開始X
    0, // dy: Canvas内の描画開始Y
    canvas.width, // dWidth: Canvas内での描画幅（ここでリサイズされる）
    canvas.height, // dHeight: Canvas内での描画高さ
  );
  return canvas;
}

/**
 * Canvas要素をBlobに変換する
 * @param {HTMLCanvasElement} canvas - 対象のCanvas要素
 * @param {string} [type="image/png"] - MIMEタイプ（"image/jpeg", "image/webp" など）
 * @param {number} [quality=1.0] - 1.0を指定して劣化を最小限にする
 * @returns {Promise<Blob>}
 */
export const canvasToBlob = (canvas, type = "image/png", quality = 1.0) => {
  return new Promise((resolve, reject) => {
    // type に基づいて Blob に変換
    // JPEG/WebP の場合は第3引数で画質を指定可能
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error(`${type} への変換に失敗しました`));
        }
      },
      type,
      quality,
    );
  });
};

/**
 * @typedef {Object} CanvasItem
 * @property {string} name - 元のファイル名（拡張子付き）
 * @property {HTMLCanvasElement} canvas - 処理済みのCanvas要素
 */

/**
 * 1つのCanvasアイテムを、ZIP保存用のデータ構造（Blobと新しい拡張子のファイル名）に変換する
 *
 * @param {CanvasItem} canvasItem - 変換対象のCanvasと名前のセット
 * @param {string} [type=EXPORT_TYPES.PNG] - 出力する画像のMIMEタイプ
 * @returns {Promise<{name: string, blob: Blob}>} ZIPに追加するためのファイル名とBlobのオブジェクト
 */
export const convertToZipItem = async (canvasItem, type = EXPORT_TYPES.PNG) => {
  // 指定された形式でBlobに変換（前述のutilsを使用）
  const blob = await canvasToBlob(canvasItem.canvas, type);

  // マッピング関数を使って拡張子を取得
  const extension = getExtensionByType(type);

  // 元の拡張子を除去して新しい拡張子を付ける
  const fileName = `${canvasItem.name.replace(/\.[^/.]+$/, "")}.${extension}`;

  return { name: fileName, blob };
};
