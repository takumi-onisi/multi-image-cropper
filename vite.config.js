import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  test: {
    globals: true, // describe や it を import なしで使えるようにする
    environment: "jsdom", // ブラウザ環境をシミュレート
  },
});
