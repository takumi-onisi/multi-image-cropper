/**
 * 画像URLからHTMLImageElementを生成してロード完了を待機する
 * @param {string} url
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    // クロスドメイン制約（CORS）を回避する必要がある場合
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) =>
      reject(new Error(`画像の読み込みに失敗しました: ${url}`));
    img.src = url;
  });
}
