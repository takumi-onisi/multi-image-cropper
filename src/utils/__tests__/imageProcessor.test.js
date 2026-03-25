import { describe, it, expect, vi, beforeEach } from "vitest";
import { performCropping } from "../imageProcessor";
import * as imageLoader from "../imageLoader";
import Cropper from "cropperjs";

// Cropperjs の動作を完全にシミュレートするモック
vi.mock("cropperjs", () => {
  const MockCropper = vi.fn();

  // 共有する状態オブジェクト
  const sharedSelection = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
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
  beforeEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  it("指定された config のサイズ通りに Canvas が生成されること", async () => {
    // 1. 準備: テスト用のダミー画像と設定
    const mockImg = { width: 1000, height: 1000 };
    const mockFile = { previewUrl: "blob:http://localhost/test-uuid" };
    const mockConfig = { x: 100, y: 150, width: 525, height: 576 };

    // loadImage が呼ばれたらダミー画像を返すようにモック
    vi.spyOn(imageLoader, "loadImage").mockResolvedValue(mockImg);

    // Canvas のメソッドを監視できるようにモック
    const mockCtx = {
      drawImage: vi.fn(),
    };
    const mockCanvas = {
      getContext: vi.fn().mockReturnValue(mockCtx),
      width: 0,
      height: 0,
    };

    // document.createElement('canvas') が呼ばれたら mockCanvas を返す
    vi.spyOn(document, "createElement").mockReturnValue(mockCanvas);

    // 2. 実行
    const result = await performCropping(mockFile, mockConfig);

    // 3. 検証
    // A. Canvas のサイズが config 通りか
    expect(mockCanvas.width).toBe(525);
    expect(mockCanvas.height).toBe(576);

    // B. drawImage が正しい引数で呼ばれているか
    // ctx.drawImage(img, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
    expect(mockCtx.drawImage).toHaveBeenCalledWith(
      mockImg,
      100, // sx
      150, // sy
      525, // sWidth
      576, // sHeight
      0, // dx
      0, // dy
      525, // dWidth
      576, // dHeight
    );

    expect(result).toBe(mockCanvas);
  });
});
