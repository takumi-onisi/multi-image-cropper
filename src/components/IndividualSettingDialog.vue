<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useImagesStore } from "../stores/imagesStore";
import CropperPanel from "../components/CropperPanel.vue";
import ExportTypeSelector from "./ExportTypeSelector.vue";

const props = defineProps({
  file: { type: Object, required: true },
});

const emit = defineEmits(["close"]);
const imagesStore = useImagesStore();

// ダイアログが開いた瞬間に個別モードをONにする
onMounted(() => {
  imagesStore.setIndividualMode(true);
});

// ダイアログが閉じる（DOMから消える）瞬間に個別モードをOFFにする
onUnmounted(() => {
  imagesStore.setIndividualMode(false);
});

const handleCommit = () => {
  imagesStore.commitIndividualEdit(props.file.previewUrl);
  emit("close");
};

const handleCancel = () => {
  imagesStore.resetIndividualEditState();
  emit("close");
};
</script>

<template>
  <Teleport to="body">
    <div class="modal-overlay" @click.self="handleCancel">
      <div class="modal-content">
        <header class="modal-header">
          <h3>個別切り抜き設定: {{ file.name }}</h3>
          <button class="close-icon" @click="handleCancel">&times;</button>
        </header>

        <main class="modal-body">
          <CropperPanel :image="file" />
        </main>

        <footer class="modal-footer">
          <ExportTypeSelector :file="file" />
          <button class="btn-primary" @click="handleCommit">完了</button>
        </footer>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal-content {
  background: white;
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.modal-header {
  padding: 1rem;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
}

.modal-footer {
  padding: 1rem;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.btn-primary {
  background: #3182ce;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.btn-secondary {
  background: #e2e8f0;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}
</style>
