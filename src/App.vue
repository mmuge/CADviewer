<template>
  <!-- Drop zone -->
  <div v-if="!selectedFile" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
    <div class="drop-inner">
      <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
           stroke="#1B4F8A" stroke-width="1.2" stroke-linecap="round">
        <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
        <polyline points="13 2 13 9 20 9"/>
      </svg>
      <h1>Open a DWG or DXF File</h1>
      <p>Drag &amp; drop your file here, or click below</p>
      <input ref="fileInput" type="file" accept=".dwg,.dxf" style="display:none" @change="onInputChange" />
      <button @click="fileInput?.click()">Browse Files</button>
      <p v-if="errorMsg" class="error">âš ï¸ {{ errorMsg }}</p>
      <div class="badges">
        <span>DWG R14â€“2018</span>
        <span>DXF ASCII</span>
        <span>ðŸ”’ 100% Private</span>
      </div>
    </div>
  </div>

  <!-- MlCadViewer: full-screen, owns its own toolbar + measure + coords -->
  <MlCadViewer
    v-else
    :local-file="selectedFile"
    theme="light"
    locale="en"
    :use-main-thread-draw="false"
    style="width:100vw; height:100vh; display:block;"
  />
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { MlCadViewer } from '@mlightcad/cad-viewer'

const fileInput    = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | undefined>(undefined)
const errorMsg     = ref('')

function onDrop(ev: DragEvent) {
  const f = ev.dataTransfer?.files[0]
  if (f) load(f)
}
function onInputChange(ev: Event) {
  const f = (ev.target as HTMLInputElement).files?.[0]
  if (f) load(f)
}
function load(f: File) {
  const ext = f.name.split('.').pop()?.toLowerCase()
  if (ext !== 'dwg' && ext !== 'dxf') {
    errorMsg.value = 'Please use a .dwg or .dxf file.'
    return
  }
  errorMsg.value = ''
  selectedFile.value = f
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }

.drop-zone {
  width: 100%; height: 100%;
  display: flex; align-items: center; justify-content: center;
  background: #f0f4f8;
}
.drop-inner {
  display: flex; flex-direction: column; align-items: center; gap: 14px;
  padding: 48px 40px; background: white; border-radius: 20px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.08); text-align: center; max-width: 420px;
}
.drop-inner h1 { font-size: 21px; font-weight: 700; color: #111; font-family: system-ui, sans-serif; }
.drop-inner p  { font-size: 14px; color: #666; font-family: system-ui, sans-serif; }
.drop-inner button {
  padding: 12px 36px; background: #1B4F8A; color: white;
  border: none; border-radius: 10px; font-size: 15px; font-weight: 600;
  cursor: pointer; font-family: system-ui, sans-serif;
}
.drop-inner button:hover { background: #163f6e; }
.error { color: #dc2626; font-size: 13px; font-weight: 600; }
.badges { display: flex; gap: 8px; flex-wrap: wrap; justify-content: center; }
.badges span {
  padding: 4px 11px; background: #f0f4f8; border: 1px solid #dce1e7;
  border-radius: 20px; font-size: 12px; font-weight: 600; color: #555;
  font-family: system-ui, sans-serif;
}
</style>

