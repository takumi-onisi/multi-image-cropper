/**
 * 切り抜きモードの定義
 */
export const CROP_MODES = {
  // 自由変形（アスペクト比固定なし）
  // ストアの初期値や、数値をクリアした状態
  FREE: null,

  // 比率指定モード（出力サイズはオリジナル解像度に依存）
  // Photoshopの「比率」に相当
  RATIO: "ratio",

  // 出力サイズ固定モード（指定したpxサイズでリサイズして書き出し）
  // Photoshopの「幅 x 高さ x 解像度」に相当 (ただし解像度の指定は不可とする)
  FIXED_SIZE: "fixed_size",
};
