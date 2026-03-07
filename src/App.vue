<template>
  <div class="app-root">

    <!-- Drop zone -->
    <div v-if="!isLoaded" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
      <div class="drop-inner">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none"
             stroke="#1B4F8A" stroke-width="1.2" stroke-linecap="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <h1>Open a DWG or DXF File</h1>
        <p>Drag & drop your file here, or click below</p>
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

    <!-- Loading overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="spinner"></div>
      <p>Opening file…</p>
    </div>

    <!-- Viewer -->
    <div v-show="isLoaded" class="viewer-wrap">
      <header class="top-bar">
        <span class="app-title">📐 CAD Viewer</span>
        <span class="file-name">{{ fileName }}</span>
        <button class="open-btn" @click="resetFile">📂 Open Another File</button>
      </header>
      <canvas ref="canvasRef" class="cad-canvas"></canvas>
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

const fileInput  = ref<HTMLInputElement | null>(null)
const canvasRef  = ref<HTMLCanvasElement | null>(null)
const isLoaded   = ref(false)
const isLoading  = ref(false)
const fileName   = ref('')
const errorMsg   = ref('')

// Lazy-load CAD manager reference
let cadManager: any = null

onMounted(async () => {
  // Pre-load the viewer engine
  try {
    const { AcApDocManager } = await import('@mlightcad/cad-simple-viewer')
    const { registerWorkers } = await import('@mlightcad/data-model')

    registerWorkers({
      dxfParserWorkerUrl:   new URL('./workers/dxf-parser-worker.js', import.meta.url).href,
      libredwgParserWorker: new URL('./workers/libredwg-parser-worker.js', import.meta.url).href,
      mtextRendererWorker:  new URL('./workers/mtext-renderer-worker.js', import.meta.url).href,
    })

    cadManager = AcApDocManager
  } catch (e) {
    console.warn('CAD engine pre-load warning:', e)
  }
})

function onDrop(ev: DragEvent) {
  const file = ev.dataTransfer?.files[0]
  if (file) loadFile(file)
}

function onInputChange(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
}

async function loadFile(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'dwg' && ext !== 'dxf') {
    errorMsg.value = 'Please use .dwg or .dxf files only.'
    return
  }

  isLoading.value = true
  errorMsg.value  = ''

  try {
    const buffer = await file.arrayBuffer()
    const data   = new Uint8Array(buffer)

    const { AcApDocManager } = await import('@mlightcad/cad-simple-viewer')
    const { registerWorkers } = await import('@mlightcad/data-model')

    // Register workers with absolute asset paths
    registerWorkers({
      dxfParserWorkerUrl:   '/assets/dxf-parser-worker.js',
      libredwgParserWorker: '/assets/libredwg-parser-worker.js',
      mtextRendererWorker:  '/assets/mtext-renderer-worker.js',
    })

    if (!canvasRef.value) throw new Error('Canvas not ready')

    // Create viewer instance on canvas
    AcApDocManager.createInstance(canvasRef.value)

    const ok = await AcApDocManager.instance.openDocument(
      file.name,
      data,
    )

    if (!ok) throw new Error('Failed to open file. It may be corrupted or unsupported.')

    fileName.value = file.name
    isLoaded.value  = true

  } catch (err: any) {
    errorMsg.value = err?.message ?? String(err)
  } finally {
    isLoading.value = false
  }
}

function resetFile() {
  isLoaded.value = false
  fileName.value = ''
  errorMsg.value = ''
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
</style>

<style scoped>
.app-root { width: 100%; height: 100%; font-family: system-ui, sans-serif; position: relative; }

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
.drop-inner svg { color: #1B4F8A; }
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

.loading-overlay {
  position: absolute; inset: 0;
  background: rgba(255,255,255,0.9);
  display: flex; flex-direction: column;
  align-items: center; justify-content: center; gap: 16px; z-index: 100;
}
.spinner {
  width: 44px; height: 44px;
  border: 4px solid #e5e7eb;
  border-top-color: #1B4F8A;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }

.viewer-wrap {
  width: 100%; height: 100%;
  display: flex; flex-direction: column;
}
.top-bar {
  height: 48px; background: white; border-bottom: 1px solid #e5e7eb;
  display: flex; align-items: center; gap: 12px; padding: 0 16px;
  flex-shrink: 0; z-index: 10; box-shadow: 0 1px 4px rgba(0,0,0,0.05);
}
.app-title { font-weight: 700; color: #1B4F8A; font-size: 15px; }
.file-name  {
  font-size: 13px; color: #555; flex: 1;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
.open-btn {
  padding: 6px 14px; border: 1px solid #ddd; border-radius: 7px;
  background: white; cursor: pointer; font-size: 13px; white-space: nowrap;
}
.open-btn:hover { background: #f0f4f8; }

.cad-canvas {
  flex: 1; min-height: 0; width: 100%;
  display: block;
}
</style>
