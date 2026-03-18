/**
 * canvas基準の座標(cropper.jsデフォルト値)から画像基準の座標へ変換する
 */
export function canvasToImageSpace(selection, transform) {
  const scaleX = transform[0];
  const scaleY = transform[3];

  const Sx = 1 / scaleX;
  const Sy = 1 / scaleY;

  const imageX = transform[4];
  const imageY = transform[5];

  console.log(`
    selectionX = selection.x = ${selection.x},
    selectionY = selection.y = ${selection.y},
    scaleX = transform[0] = ${scaleX},
    scaleY = transform[3] = ${scaleY},
    Sx = 1 / scaleX = ${Sx},
    Sy = 1 / scaleY = ${Sy},
    imageX = transform[4] = ${imageX},
    imageY = transform[5] = ${imageY}
    `);

  return {
    x: Math.round((selection.x - imageX) * Sx), // 画像の左端を起点とする
    y: Math.round((selection.y - imageY) * Sy), // 画像の上端を起点とする
    width: Math.round(selection.width * Sx), // 画像のオリジナル解像度に基づいたピクセル値
    height: Math.round(selection.height * Sy), // 画像のオリジナル解像度に基づいたピクセル値
  };
}

/**
 * 画像基準の座標からcanvas基準の座標(cropper.jsデフォルト値)へ変換する
 */
export function imageToCanvasSpace(selection, transform) {
  const scaleX = transform[0];
  const scaleY = transform[3];

  const imageX = transform[4];
  const imageY = transform[5];

  return {
    x: selection.x * scaleX + imageX, // canvasの左端を起点とする(cropper.jsデフォルト)
    y: selection.y * scaleY + imageY, // canvasの上端を起点とする(cropper.jsデフォルト)
    width: selection.width * scaleX, // cssでの表示サイズに基づいたピクセル値(cropper.jsデフォルト)
    height: selection.height * scaleY, // cssでの表示サイズに基づいたピクセル値(cropper.jsデフォルト)
  };
}
