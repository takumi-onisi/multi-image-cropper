/**
 * 表示座標(View)から画像オリジナル座標(Source)へ変換する
 * @param {object} viewRect - {x, y, width, height} (Canvas基準)
 * @param {object} params - { offset: {x, y}, scale: {x, y} }
 */
export function convertViewToSource(viewRect, { offset, scale }) {
  return {
    x: Math.round((viewRect.x - offset.x) / scale.x),
    y: Math.round((viewRect.y - offset.y) / scale.y),
    width: Math.round(viewRect.width / scale.x),
    height: Math.round(viewRect.height / scale.y),
  };
}

/**
 * 画像オリジナル座標(Source)から表示座標(View)へ変換する
 * @param {object} sourceRect - {x, y, width, height} (画像基準)
 * @param {object} params - { offset: {x, y}, scale: {x, y} }
 */
export function convertSourceToView(sourceRect, { offset, scale }) {
  return {
    x: sourceRect.x * scale.x + offset.x,
    y: sourceRect.y * scale.y + offset.y,
    width: sourceRect.width * scale.x,
    height: sourceRect.height * scale.y,
  };
}
