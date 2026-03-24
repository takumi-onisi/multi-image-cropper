import { loadImage } from "./imageLoader";
/**
 * fileと設定から切り抜き済みCanvasを生成する
 * @param {object} file - ストアに保存された画像情報
 * @param {object} cropConfig - 切り抜き設定 {x, y, width, height}
 * @returns {Promise<HTMLCanvasElement>} 切り抜かれたCanvas要素
 */
export async function performCropping(file, cropConfig) {
  const img = await loadImage(file.previewUrl); // 画像をロード
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  // ストアにある「整数値」をそのまま使う
  const { x, y, width, height } = cropConfig;

  canvas.width = width;
  canvas.height = height;

  // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
  // 元画像の (x, y) から (width, height) 分を、Canvasの (0, 0) に描画
  ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
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
 * @param {string} [type="image/png"] - 出力する画像のMIMEタイプ
 * @returns {Promise<{name: string, blob: Blob}>} ZIPに追加するためのファイル名とBlobのオブジェクト
 */
export const convertToZipItem = async (canvasItem, type = "image/png") => {
  // 1. 指定された形式でBlobに変換（前述のutilsを使用）
  const blob = await canvasToBlob(canvasItem.canvas, type);

  // 2. MIMEタイプから拡張子を決定 (例: "image/jpeg" -> "jpg")
  // ※PNGの場合はそのまま "png"、JPEGの場合は "jpg" に変換する
  let extension = type.split("/")[1];
  if (extension === "jpeg") extension = "jpg";

  // 3. 元の拡張子を除去して新しい拡張子を付ける
  const fileName = `${canvasItem.name.replace(/\.[^/.]+$/, "")}.${extension}`;

  return { name: fileName, blob };
};
