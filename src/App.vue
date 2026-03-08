<template>
  <div class="app-root">

    <!-- Drop zone — shown until first file is picked -->
    <div v-if="!selectedFile" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
      <div class="drop-inner">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
             stroke="#1B4F8A" stroke-width="1.2" stroke-linecap="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <h1>Open a DWG or DXF File</h1>
        <p>Drag &amp; drop your file here, or click below</p>
        <input ref="fileInput" type="file" accept=".dwg,.dxf" style="display:none" @change="onInputChange" />
        <button @click="fileInput?.click()">Browse Files</button>
        <p v-if="errorMsg" class="error-msg">⚠️ {{ errorMsg }}</p>
        <div class="badges">
          <span>DWG R14–2018</span>
          <span>DXF ASCII</span>
          <span>🔒 100% Private</span>
        </div>
      </div>
    </div>

    <!-- Full-screen MlCadViewer — owns its own toolbar, menu, coords, measure -->
    <MlCadViewer
      v-else
      :local-file="selectedFile"
      theme="light"
      :use-main-thread-draw="false"
      locale="en"
      class="cad-viewer-full"
    />

  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MlCadViewer } from '@mlightcad/cad-viewer'
// CSS imported via vite config instead

const fileInput    = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | undefined>(undefined)
const errorMsg     = ref('')

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
    errorMsg.value = 'Please use .dwg or .dxf files only.'
    return
  }
  errorMsg.value = ''
  selectedFile.value = file
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
</style>

<style scoped>
.app-root { width: 100%; height: 100%; }

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
.error-msg { color: #dc2626; font-size: 13px; font-weight: 600; }
.badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.badges span {
  padding: 4px 12px; background: #f0f4f8; border: 1px solid #dce1e7;
  border-radius: 20px; font-size: 12px; font-weight: 600; color: #555;
}

/* Viewer takes full screen — MlCadViewer handles its own UI */
.cad-viewer-full {
  width: 100%;
  height: 100%;
  display: block;
}
</style>
