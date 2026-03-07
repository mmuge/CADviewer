<template>
  <div class="app-root" :dir="dir">

    <!-- Show file picker if no file loaded -->
    <div v-if="!selectedFile" class="drop-zone" @dragover.prevent @drop.prevent="onDrop">
      <div class="drop-inner">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
        </svg>
        <h1>{{ dir === 'rtl' ? 'افتح ملف DWG أو DXF' : 'Open a DWG or DXF File' }}</h1>
        <p>{{ dir === 'rtl' ? 'اسحب الملف هنا، أو' : 'Drag & drop your file here, or' }}</p>
        <input ref="fileInput" type="file" accept=".dwg,.dxf" style="display:none" @change="onInputChange" />
        <button @click="fileInput?.click()">
          {{ dir === 'rtl' ? 'استعراض الملفات' : 'Browse Files' }}
        </button>
        <div class="badges">
          <span>DWG R14–2018</span>
          <span>DXF ASCII</span>
          <span>🔒 {{ dir === 'rtl' ? 'خصوصية تامة' : '100% Private' }}</span>
        </div>
      </div>
    </div>

    <!-- CAD Viewer Component (official @mlightcad/cad-viewer) -->
    <div v-if="selectedFile" class="viewer-wrap">
      <!-- Top bar -->
      <header class="top-bar">
        <span class="app-title">📐 CAD Viewer</span>
        <span class="file-name">{{ selectedFile.name }}</span>
        <div class="bar-actions">
          <button @click="toggleLang">{{ isAr ? 'EN' : 'ع' }}</button>
          <button @click="selectedFile = null">📂 {{ isAr ? 'فتح ملف آخر' : 'Open File' }}</button>
        </div>
      </header>

      <!-- The official viewer component -->
      <MlCadViewer
        class="cad-viewer"
        :local-file="selectedFile"
        :locale="isAr ? 'zh' : 'en'"
      />
    </div>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { MlCadViewer } from '@mlightcad/cad-viewer'

const selectedFile = ref<File | null>(null)
const fileInput    = ref<HTMLInputElement | null>(null)
const isAr         = ref(false)
const dir          = computed(() => isAr.value ? 'rtl' : 'ltr')

onMounted(() => {
  isAr.value = navigator.language.startsWith('ar')
})

function toggleLang() {
  isAr.value = !isAr.value
}

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
  selectedFile.value = file
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; background: #f0f2f5; }
</style>

<style scoped>
.app-root {
  width: 100%;
  height: 100%;
  font-family: system-ui, -apple-system, sans-serif;
}

/* ── Drop zone ── */
.drop-zone {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f2f5;
}
.drop-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 48px 40px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
  text-align: center;
  max-width: 420px;
  color: #555;
}
.drop-inner svg { color: #1B4F8A; }
.drop-inner h1 { font-size: 22px; font-weight: 700; color: #1a1a1a; }
.drop-inner p  { font-size: 14px; color: #666; }
.drop-inner button {
  padding: 13px 36px;
  background: #1B4F8A;
  color: white;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s;
}
.drop-inner button:hover { background: #1a3f70; }
.badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
}
.badges span {
  padding: 4px 12px;
  background: #f0f4f8;
  border: 1px solid #ddd;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  color: #555;
}

/* ── Viewer wrap ── */
.viewer-wrap {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.top-bar {
  height: 48px;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 16px;
  flex-shrink: 0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);
}
.app-title { font-weight: 700; color: #1B4F8A; font-size: 15px; }
.file-name  { font-size: 13px; color: #666; flex: 1;
               overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.bar-actions { display: flex; gap: 8px; }
.bar-actions button {
  padding: 6px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  transition: background 0.15s;
}
.bar-actions button:hover { background: #f0f4f8; }

/* CAD viewer takes all remaining height */
.cad-viewer {
  flex: 1;
  min-height: 0;
  width: 100%;
}
</style>
