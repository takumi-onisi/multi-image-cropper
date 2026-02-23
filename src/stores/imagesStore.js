import { defineStore } from "pinia";
import { ref } from "vue";

export const useImagesStore = defineStore("images", () => {
  const fileList = ref([]);

  return {
    fileList,
  };
});
