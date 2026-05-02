<script setup>
import { MAX_FILE_COUNT } from "../constants/config";
</script>

<template>
  <section class="hero-section">
    <div class="container hero-container">
      <!-- 左カラム：キャッチコピー -->
      <div class="hero-left">
        <h1>すべての画像を、同じ位置で一括切り抜き。</h1>
        <p class="sub-copy">
          複数の画像を一括で、同じサイズ・同じポジションで切り抜ける。
        </p>
        <p class="sub-copy">
          面倒な繰り返し作業を、たった一度の操作で終わらせましょう。
        </p>
      </div>

      <!-- 右カラム：特徴リスト -->
      <div class="hero-right">
        <ul class="feature-list">
          <li>
            <strong>最大 {{ MAX_FILE_COUNT }} 枚</strong>を一括切り抜き可能
          </li>
          <li>
            <strong>完全ローカル処理</strong
            >：画像は外部へ送信されず、ブラウザ内で完結します
          </li>
          <li>
            <strong>2つのモード</strong
            >：相対・絶対座標の切り替えで柔軟な設定が可能
          </li>
          <li>
            <strong>高速プレビュー</strong
            >：書き出し前にすべての結果をその場で確認できます
          </li>
        </ul>
      </div>
    </div>
  </section>
</template>

<style scoped>
.hero-section {
  padding: 48px 0;
  background-color: #fdfdfd;
  border-bottom: 1px solid #eee;
  margin-bottom: 32px;
}

.hero-container {
  display: flex;
  gap: 60px;
  align-items: center;
}

.hero-left {
  flex: 1.2;
}

.hero-left h1 {
  font-size: 1.2rem;
  line-height: 1.3;
  color: var(--text-main);
  margin-bottom: 20px;
  font-weight: 800;
}

.sub-copy {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-main);
}

.hero-right {
  flex: 1;
  background: #ffffff;
  padding: 24px;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.feature-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.feature-list li {
  margin-bottom: 16px;
  padding-left: 28px;
  position: relative;
  font-size: 0.95rem;
  color: #444;
  line-height: 1.5;
}

.feature-list li:last-child {
  margin-bottom: 0;
}

/* チェックマークの装飾 */
.feature-list li::before {
  content: "✓";
  position: absolute;
  left: 0;
  color: var(--primary-color);
  font-weight: bold;
}

/* スマートフォン対応（1カラム化） */
@media (max-width: 768px) {
  .hero-container {
    flex-direction: column;
    gap: 32px;
    text-align: center;
  }

  .hero-left h1 {
    font-size: 1.8rem;
  }

  .feature-list li {
    text-align: left;
    max-width: 400px;
    margin-left: auto;
    margin-right: auto;
  }
}
</style>
