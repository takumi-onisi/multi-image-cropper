<script setup>
import { ref, computed } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import { performCropping, convertToZipItem } from "../utils/imageProcessor";
import { downloadFilesAsZip } from "../utils/zip";

const imagesStore = useImagesStore();
const isProcessing = ref(false);
const currentCount = ref(0);

const hasFiles = computed(() => imagesStore.fileList.length > 0);
const totalCount = computed(() => imagesStore.fileList.length);

const handleProcessAll = async () => {
  if (isProcessing.value) return;

  isProcessing.value = true;
  currentCount.value = 0;
  const results = [];

  try {
    for (const fileItem of imagesStore.fileList) {
      currentCount.value++;
      // 切り抜き実行
      const cropConfig = imagesStore.getFileCropConfig(fileItem.previewUrl);
      const canvas = await performCropping(fileItem, cropConfig.selection);
      results.push({
        name: fileItem.name,
        canvas: canvas,
      });
    }

    // ファイル形式（将来的にユーザー設定等から取得することを想定）
    const exportType = "image/png";
    // Canvasの配列をZIP用のデータ配列に変換
    const zipFilePromises = results.map((item) =>
      convertToZipItem(item, exportType),
    );
    const zipFiles = await Promise.all(zipFilePromises);

    // ZIP化してダウンロード
    await downloadFilesAsZip(zipFiles);
    // メモリ解放：Canvas要素は巨大なので使い終わったらクリアするのが安全
    results.forEach((item) => {
      item.canvas.width = 0;
      item.canvas.height = 0;
    });

    // ここで ZIP 生成や一括ダウンロード処理へ渡す
    console.log("全件処理完了:", results);
    console.log(`${results.length} 件の処理が完了しました。`);
  } catch (error) {
    console.error("一括処理中にエラーが発生しました:", error);
    console.log("一部の画像で処理に失敗しました。");
  } finally {
    isProcessing.value = false;
  }
};
</script>

<template>
  <div class="crop-execute-container">
    <button
      @click="handleProcessAll"
      :disabled="isProcessing || !hasFiles"
      class="execute-button"
    >
      {{ isProcessing ? "処理中..." : "すべての画像を切り抜き" }}
    </button>

    <span v-if="isProcessing" class="progress">
      {{ currentCount }} / {{ totalCount }}
    </span>
  </div>
</template>

<style scoped>
.execute-button {
  background-color: #4a90e2;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.execute-button:disabled {
  background-color: #ccc;
}
.progress {
  margin-left: 10px;
  font-size: 0.9em;
}
</style>
