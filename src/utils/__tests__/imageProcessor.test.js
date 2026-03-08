import { describe, it, expect, vi } from "vitest";
import { performCropping } from "../imageProcessor";
import Cropper from "cropperjs";

// Cropperjs の動作を完全にシミュレートするモック
vi.mock("cropperjs", () => {
  const MockCropper = vi.fn();

  // 共有する状態オブジェクト
  const sharedSelection = {
    x: 0, y: 0, width: 0, height: 0,
    $toCanvas: vi.fn().mockResolvedValue(document.createElement("canvas")),
  };

  const sharedImage = {
    $ready: vi.fn().mockResolvedValue(true),
    $setTransform: vi.fn(),
  };

  // モックの設定
  MockCropper.prototype.getCropperImage = vi.fn(() => sharedImage);
  MockCropper.prototype.getCropperSelection = vi.fn(() => sharedSelection);
  MockCropper.prototype.destroy = vi.fn();

  return { default: MockCropper };
});

describe("performCropping", () => {
  it("Cropperへのパラメータ設定からCanvas生成、後片付けまでが正しく行われること", async () => {
    // Cropperに対してAPIを正しく叩いていることを検証する

    // 準備：テスト用のダミー画像と設定
    const dummyImg = document.createElement("img");
    const mockConfig = {
      selection: { x: 100, y: 150, width: 200, height: 250 },
      transform: [1, 0, 0, 1, 10, 20],
    };

    // 実行
    const canvas = await performCropping(dummyImg, mockConfig);

    // 検証：Cropperが正しくインスタンス化されたか
    expect(Cropper).toHaveBeenCalled();

    // 検証：内部で正しく値が代入されたかを検証

    // インスタンスを取得（Cropperのモックインスタンスにアクセス）
    const instance = Cropper.mock.results[0].value;
    const selection = instance.getCropperSelection();
    const image = instance.getCropperImage();

    // 値が正しく反映されているか確認
    expect(selection.x).toBe(mockConfig.selection.x);
    expect(selection.y).toBe(mockConfig.selection.y);
    expect(selection.width).toBe(mockConfig.selection.width);
    expect(selection.height).toBe(mockConfig.selection.height);

    // transform が正しく適用されたか（mock関数の呼び出し回数や引数を確認）
    expect(image.$setTransform).toHaveBeenCalledWith(...mockConfig.transform);

    // 検証：戻り値がCanvasであるか
    expect(canvas).toBeInstanceOf(HTMLCanvasElement);

    // 検証：destroy が呼ばれているかも確認（メモリリーク防止のため重要）
    expect(instance.destroy).toHaveBeenCalled();
  });
});
