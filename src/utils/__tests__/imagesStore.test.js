import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useImagesStore } from "../../stores/imagesStore";

describe("imagesStore: setGlobalConfig のガードレールテスト", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  const validConfig = {
    selection: { x: 0, y: 0, width: 100, height: 100 },
    transform: [1, 0, 0, 1, 0, 0],
  };

  it("正しいデータが渡された場合、正常に設定が反映されること", () => {
    const store = useImagesStore();
    store.fileList = [{ previewUrl: "test1", cropConfig: null }];

    expect(() => store.setGlobalConfig(validConfig)).not.toThrow();
    expect(store.fileList[0].cropConfig.selection.width).toBe(100);
  });

  it("不正なデータ（プロパティ欠落）が渡された場合、エラーを投げて開発者に通知すること", () => {
    const store = useImagesStore();
    const invalidConfig = { selection: { x: 0 } }; // transform がない

    // 開発者が間違ったときに、静かに失敗せず、エラーを出すことを確認
    expect(() => store.setGlobalConfig(invalidConfig)).toThrow(
      "Missing required properties",
    );
  });
});
