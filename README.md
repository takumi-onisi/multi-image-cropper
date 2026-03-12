# Image Cropper

複数の画像を同じ構図で一括切り抜きし、ZIPファイルとしてまとめてダウンロードできるWebツールです。
1枚目の画像で行った切り抜き設定をすべての画像に自動適用し、面倒な反復作業を数秒で完了させます。

## 🚀 主な機能

- **スマート一括トリミング**: 最初の画像で設定した位置・サイズ・変形（Transform）を全画像に自動適用。
- **直感的な操作**: [Cropper.js v2](https://github.com/fengyuanchen/cropperjs) を採用し、スムーズなプレビューと操作感を実現。
- **高速書き出し**: ブラウザ上で並列処理を行い、ZIP形式で一括保存。
- **プライバシー保護**: すべての処理をクライアントサイド（ブラウザ内）で完結。画像サーバーへのアップロードは一切行いません。

## 🛠 技術スタック

- **Framework**: Vue 3 (Composition API)
- **State Management**: Pinia
- **Core Library**: Cropper.js v2 (Web Components)
- **Utilities**: JSZip, FileSaver.js
- **Build Tool**: Vite

## 📅 今後のロードマップ (Planned Features)

ユーザーの利便性向上のため、以下の機能を順次追加予定です。

- [ ] **プロパティバーの設置**: 数値入力による精密な座標・サイズ指定機能。
- [ ] **個別調整モーダル**: 全体設定の適用後、特定の画像だけをポップアップ画面で微調整できる機能。
- [ ] **保存形式・画質の選択**: 出力フォーマット（PNG / JPEG）の切り替えおよび、背景色のカスタマイズ。
- [ ] **進捗インジケーター**: 大量画像処理時のステータス可視化（「5/10 枚目処理中...」）。

## 📦 インストールと実行

```bash
# リポジトリをクローン
git clone [https://github.com/takumi-onisi/image-cropper.git](https://github.com/takumi-onisi/image-cropper.git)

# ディレクトリに移動
cd image-cropper

# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```
