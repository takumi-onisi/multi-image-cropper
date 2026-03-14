import { describe, it, expect, beforeEach } from "vitest";
import { setActivePinia, createPinia } from "pinia";
import { useImagesStore } from "../../stores/imagesStore";

describe("imagesStore: setGlobalConfig のガードレールテスト", () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  describe("正常系", () => {
    it("正しいデータが渡された場合、ストアの初期値が期待通りに更新されること", () => {
      const store = useImagesStore();
      // スモークチェック: 設定前の初期状態を確認する
      // こうすることで「デフォルトが0であることを前提としてテストする」ことが明確になる
      expect(store.getGlobalConfig.selection.width).toBe(0);
      expect(store.getGlobalConfig.transform[0]).toBe(1);

      // 2. 特殊な値を用意する（初期値と絶対にかぶらない値）
      const testConfig = {
        selection: { x: 50, y: 50, width: 999, height: 888 },
        transform: [2, 0, 0, 2, 10, 20],
      };

      // 3. アクション実行
      store.setGlobalConfig(testConfig);

      // 4. 検証: ゲッター経由でチェック
      expect(store.getGlobalConfig.selection.width).toBe(999);
      expect(store.getGlobalConfig.selection.height).toBe(888);
      expect(store.getGlobalConfig.transform[0]).toBe(2);
    });
    it("個別設定があるファイルは維持され、ないファイルはグローバルに追従すること", () => {
      const store = useImagesStore();

      // 準備：ファイルを2つ用意する
      store.fileList = [
        { previewUrl: "has-custom", name: "individual.png", cropConfig: null },
        { previewUrl: "no-custom", name: "global.png", cropConfig: null },
      ];

      // 「個別設定用」と「更新後のグローバル用」のデータを用意（値をバラバラにする）
      const customConfig = {
        selection: { x: 10, y: 10, width: 500, height: 500 },
        transform: [2, 0, 0, 2, 10, 20],
      };
      const newGlobalConfig = {
        selection: { x: 0, y: 0, width: 100, height: 100 },
        transform: [4, 0, 0, 4, 20, 40],
      };

      // 実行：1つ目のファイルに個別設定を適用し、その後にグローバル設定全体を更新
      store.setFileConfig("has-custom", customConfig);
      store.setGlobalConfig(newGlobalConfig);

      // 検証：
      // A. 個別設定したファイルは、グローバルの影響を受けず customConfig を維持しているか
      const configA = store.getFileCropConfig("has-custom");
      expect(configA.selection.width).toBe(500);
      expect(configA.selection.width).not.toBe(newGlobalConfig.selection.width);

      // B. 個別設定していないファイルは、新しいグローバル設定に追従しているか
      const configB = store.getFileCropConfig("no-custom");
      expect(configB.selection.width).toBe(100);
    });
    it("個別設定を変更しても、グローバル設定（マスター）は書き換わらないこと", () => {
      const store = useImagesStore();

      // 1. 準備：テスト用のファイルをストアに登録する
      // 直接 fileList を操作して、テストに必要な最小限のデータを注入
      store.fileList = [
        {
          previewUrl: "test-file-url",
          name: "test.png",
          cropConfig: null,
        },
      ];

      // 2. 初期状態のグローバル設定をセット
      const initialGlobal = {
        selection: { x: 0, y: 0, width: 100, height: 100 },
        transform: [1, 0, 0, 1, 0, 0],
      };
      store.setGlobalConfig(initialGlobal);

      // 3. 「個別設定用」のデータを用意（グローバルとは違う値）
      const customConfig = {
        selection: { x: 50, y: 50, width: 999, height: 999 },
        transform: [2, 0, 0, 2, 0, 0],
      };

      // 4. 実行：特定のファイルに対して個別設定を適用
      store.setFileConfig("test-file-url", customConfig);

      // 5. 検証 A：個別設定がそのファイルに正しく反映されているか
      const fileConfig = store.getFileCropConfig("test-file-url");
      expect(fileConfig.selection.width).toBe(999);

      // 6. 検証 B（最重要）：グローバル設定が「100」のまま維持されているか
      // もし実装が「参照渡し」になってしまっていると、ここが 999 に書き換わってテストが失敗します
      const globalConfig = store.getGlobalConfig;
      expect(globalConfig.selection.width).toBe(100);
      expect(globalConfig.selection.width).not.toBe(999);

      // 配列（transform）の独立性もついでに確認
      expect(globalConfig.transform[0]).toBe(1);
      expect(globalConfig.transform[0]).not.toBe(2);
    });
  });
  describe("異常系", () => {
    it("不正なデータ（プロパティ欠落）が渡された場合、エラーを投げて開発者に通知すること", () => {
      const store = useImagesStore();
      const invalidConfig = { selection: { x: 0 } }; // transform がない

      // 開発者が間違ったときに、静かに失敗せず、エラーを出すことを確認
      expect(() => store.setGlobalConfig(invalidConfig)).toThrow(
        "Missing required properties",
      );
    });
  });
});
