/**
 * 表示座標(View)から画像オリジナル座標(Source)へ変換する
 * @param {object} viewRect - {x, y, width, height} (Canvas基準)
 * @param {object} params - { offset: {x, y}, scale: {x, y} }
 */
export function convertViewToSource(viewRect, { offset, scale }) {
  // 左上
  const left = (viewRect.x - offset.x) / scale.x;
  const top = (viewRect.y - offset.y) / scale.y;

  // 右下
  const right = (viewRect.x + viewRect.width - offset.x) / scale.x;
  const bottom = (viewRect.y + viewRect.height - offset.y) / scale.y;

  // 🔥 ここが重要（点ごとにfloor）
  const x = Math.floor(left);
  const y = Math.floor(top);
  const x2 = Math.floor(right);
  const y2 = Math.floor(bottom);

  return {
    x,
    y,
    width: x2 - x,
    height: y2 - y,
  };
}

/**
 * 画像オリジナル座標(Source)から表示座標(View)へ変換する
 * @param {object} sourceRect - {x, y, width, height} (画像基準)
 * @param {object} params - { offset: {x, y}, scale: {x, y} }
 */
export function convertSourceToView(sourceRect, { offset, scale }) {
  // 左上
  const left = sourceRect.x * scale.x + offset.x;
  const top = sourceRect.y * scale.y + offset.y;

  // 右下
  const right = (sourceRect.x + sourceRect.width) * scale.x + offset.x;
  const bottom = (sourceRect.y + sourceRect.height) * scale.y + offset.y;

  return {
    x: left,
    y: top,
    width: right - left,
    height: bottom - top,
  };
}
