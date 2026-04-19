<template>
  <header class="app-header">
    <div class="header-container">
      <div class="brand-area">
        <div class="title-group">
          <h1 class="main-title">Multi Image Cropper</h1>
          <p class="sub-title">画像一括トリミングツール</p>
        </div>
      </div>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  padding: 1rem 1.25rem 1rem;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  margin-bottom: 1.25rem;
}

.header-container {
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.main-title {
  font-size: 1.5rem;
  font-weight: 800;
  color: var(--text-main);
  margin: 0;
  letter-spacing: -0.01em;
  font-family:
    "Inter",
    -apple-system,
    sans-serif;
}

.sub-title {
  font-size: 0.8rem;
  margin: 2px 0 0 0;
}
</style>
