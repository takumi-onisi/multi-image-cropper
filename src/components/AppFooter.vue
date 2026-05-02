<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p class="copyright">&copy; 2026 Takumi Onisi / Multi Image Cropper</p>

      <a
        href="https://github.com/takumi-onisi/image-cropper"
        target="_blank"
        rel="noopener noreferrer"
        class="github-link"
      >
        <span class="icon">GitHub</span>
      </a>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  width: 100%;
  padding: 20px 0;
  margin-top: auto;
  border-top: 1px solid var(--border-color);
  color: var(--text-sub);
  font-size: var(--font-size-base);
}

.footer-content {
  max-width: 1000px;
  margin: 0 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
}

.github-link {
  color: var(--text-sub);
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.2s;
}

.github-link:hover {
  color: var(--primary-color);
}

.icon {
  text-decoration: underline;
}
</style>
