/**
 * 設定からアスペクト比を計算する
 */
export const calculateAspectRatio = (config) => {
  const { mode, ratio, targetSize } = config;

  if (mode === CROP_MODES.FIXED_SIZE) {
    // 固定サイズモードは targetSize から比率を算出
    if (targetSize.width > 0 && targetSize.height > 0) {
      return targetSize.width / targetSize.height;
    }
  } else if (mode === CROP_MODES.RATIO) {
    // 比率モードは保存された ratio オブジェクトから算出
    if (ratio.width > 0 && ratio.height > 0) {
      return ratio.width / ratio.height;
    }
  }
  return null; // FREEモードまたは計算不可
};
