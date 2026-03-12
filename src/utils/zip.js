import JSZip from "jszip";
import { saveAs } from "file-saver";
import { DEFAULT_ZIP_FILENAME } from "../constants/zip";

/**
 * @typedef {Object} ZipFile
 * @property {string} name - ファイル名
 * @property {Blob} blob - ファイルのバイナリデータ
 */

/**
 * 複数のファイルをZIPにまとめてダウンロードする
 * * @param {ZipFile[]} files - ZIPに含めるファイル情報の配列
 * @param {string} [zipName="download.zip"] - 生成するZIPファイル名
 */
export const downloadFilesAsZip = async (
  files,
  zipName = DEFAULT_ZIP_FILENAME,
) => {
  if (files.length === 0) return;

  const zip = new JSZip();

  files.forEach(({ name, blob }) => {
    zip.file(name, blob);
  });

  const zipContent = await zip.generateAsync({ type: "blob" });
  saveAs(zipContent, zipName);
};
