/**
 * canvas基準の座標(cropper.jsデフォルト値)から画像基準の座標へ変換する
 */
export function canvasToImageSpace(selection, params) {
  const { imageX, imageY, scaleX, scaleY } = params;

  return {
    x: Math.round((selection.x - imageX) / scaleX), // 画像の左端を起点とする
    y: Math.round((selection.y - imageY) / scaleY), // 画像の上端を起点とする
    width: Math.round(selection.width / scaleX), // 画像のオリジナル解像度に基づいたピクセル値
    height: Math.round(selection.height / scaleY), // 画像のオリジナル解像度に基づいたピクセル値
  };
}

/**
 * 画像基準の座標からcanvas基準の座標(cropper.jsデフォルト値)へ変換する
 */
export function imageToCanvasSpace(selection, params) {
  const { imageX, imageY, scaleX, scaleY } = params;

  return {
    x: selection.x * scaleX + imageX, // canvasの左端を起点とする(cropper.jsデフォルト)
    y: selection.y * scaleY + imageY, // canvasの上端を起点とする(cropper.jsデフォルト)
    width: selection.width * scaleX, // cssでの表示サイズに基づいたピクセル値(cropper.jsデフォルト)
    height: selection.height * scaleY, // cssでの表示サイズに基づいたピクセル値(cropper.jsデフォルト)
  };
}
