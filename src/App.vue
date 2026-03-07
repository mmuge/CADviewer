<template>
  <div class="app-root">

    <!-- ── File picker screen ── -->
    <div v-if="!fileUrl" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
      <div class="drop-inner">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
             stroke="#1B4F8A" stroke-width="1.2" stroke-linecap="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
          <line x1="9" y1="13" x2="15" y2="13"/>
          <line x1="9" y1="17" x2="12" y2="17"/>
        </svg>
        <h1>Open a DWG or DXF File</h1>
        <p>Drag & drop your file here, or click below</p>
        <input ref="fileInput" type="file" accept=".dwg,.dxf" style="display:none" @change="onInputChange" />
        <button @click="fileInput?.click()">Browse Files</button>
        <div class="badges">
          <span>DWG R14–2018</span>
          <span>DXF ASCII</span>
          <span>🔒 100% Private</span>
        </div>
      </div>
    </div>

    <!-- ── CAD Viewer screen ── -->
    <div v-else class="viewer-wrap">
      <header class="top-bar">
        <span class="app-title">📐 CAD Viewer</span>
        <span class="file-name">{{ fileName }}</span>
        <button class="open-btn" @click="closeFile">📂 Open Another File</button>
      </header>

      <!-- Official MlCadViewer — pass the blob URL directly -->
      <MlCadViewer
        class="cad-viewer"
        locale="en"
        :url="fileUrl"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MlCadViewer } from '@mlightcad/cad-viewer'

const fileInput = ref<HTMLInputElement | null>(null)
const fileUrl   = ref<string | null>(null)
const fileName  = ref('')

function onDrop(ev: DragEvent) {
  const file = ev.dataTransfer?.files[0]
  if (file) loadFile(file)
}

function onInputChange(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

function loadFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'dwg' && ext !== 'dxf') {
    alert('Please use .dwg or .dxf files only.')
    return
  }
  // Revoke previous URL to free memory
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)

  fileName.value = file.name
  fileUrl.value  = URL.createObjectURL(file)
}

function closeFile() {
  if (fileUrl.value) URL.revokeObjectURL(fileUrl.value)
  fileUrl.value = null
  fileName.value = ''
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
</style>

<style scoped>
.app-root { width: 100%; height: 100%; font-family: system-ui, sans-serif; }

/* Drop zone */
.drop-zone {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #f0f4f8;
}
.drop-inner {
  display: flex; flex-direction: column; align-items: center; gap: 16px;
  padding: 52px 44px; background: white; border-radius: 20px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08); text-align: center; max-width: 440px;
}
.drop-inner h1 { font-size: 22px; font-weight: 700; color: #111; }
.drop-inner p  { font-size: 14px; color: #666; }
.drop-inner button {
  padding: 13px 40px; background: #1B4F8A; color: white;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; transition: background 0.15s;
}
.drop-inner button:hover { background: #163f6e; }
.badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.badges span {
  padding: 4px 12px; background: #f0f4f8; border: 1px solid #dce1e7;
  border-radius: 20px; font-size: 12px; font-weight: 600; color: #555;
}

/* Viewer */
.viewer-wrap {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
}
.top-bar {
  height: 48px; background: white; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; gap: 12px; padding: 0 16px;
  flex-shrink: 0; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.app-title { font-weight: 700; color: #1B4F8A; font-size: 15px; }
.file-name  {
  font-size: 13px; color: #555; flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.open-btn {
  padding: 6px 14px; border: 1px solid #ddd; border-radius: 7px;
  background: white; cursor: pointer; font-size: 13px; white-space: nowrap;
  transition: background 0.15s;
}
.open-btn:hover { background: #f0f4f8; }

/* The viewer fills remaining space */
.cad-viewer { flex: 1; min-height: 0; width: 100%; }
</style>
