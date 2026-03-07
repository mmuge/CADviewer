<template>
  <div class="app-root" :data-theme="isDark ? 'dark' : 'light'" :dir="dir">

    <FileDropZone v-if="!hasFile" @file="onFile" />

    <canvas ref="canvasRef" class="cad-canvas" />

    <header class="top-bar">
      <div class="top-bar-left">
        <span class="app-title">📐 CAD Viewer</span>
        <span v-if="fileName" class="file-name">{{ fileName }}</span>
      </div>
      <div class="top-bar-right">
        <button class="icon-btn" :title="t('ui.toggleLang')" @click="toggleLang">
          {{ locale === 'ar' ? 'EN' : 'ع' }}
        </button>
        <button class="icon-btn" :title="t('ui.toggleTheme')" @click="toggleTheme">
          {{ isDark ? '☀️' : '🌙' }}
        </button>
        <button class="icon-btn" :title="t('ui.openFile')" @click="showFilePicker = true">
          📂
        </button>
      </div>
    </header>

    <input
      ref="hiddenInput"
      type="file"
      accept=".dwg,.dxf"
      style="display:none"
      @change="onHiddenInput"
    />

    <MeasureToolbar v-if="hasFile" />
    <MeasureResults v-if="hasFile" :file-name="fileName" />
    <CursorCoord :canvas="canvasRef" />

    <transition name="fade">
      <div v-if="isLoading" class="loading-overlay">
        <div class="spinner" />
        <span>{{ t('ui.loading') }}</span>
      </div>
    </transition>

    <transition name="slide-up">
      <div v-if="errorMsg" class="error-toast" @click="errorMsg = ''">
        ⚠️ {{ errorMsg }}
      </div>
    </transition>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, provide, watch, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

import FileDropZone   from '@/components/FileDropZone.vue'
import MeasureToolbar from '@/components/MeasureToolbar.vue'
import MeasureResults from '@/components/MeasureResults.vue'
import CursorCoord    from '@/components/CursorCoord.vue'
import { useTheme }   from '@/composables/useTheme'
import { handleCanvasClick, handleEntityClick, measureMode } from '@/composables/useMeasure'

const { t, locale } = useI18n()
const dir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

function toggleLang() {
  locale.value = locale.value === 'ar' ? 'en' : 'ar'
  localStorage.setItem('lang', locale.value)
}

const { isDark, toggle: toggleTheme } = useTheme()

const canvasRef      = ref<HTMLCanvasElement | null>(null)
const hasFile        = ref(false)
const fileName       = ref('')
const isLoading      = ref(false)
const errorMsg       = ref('')
const showFilePicker = ref(false)
const hiddenInput    = ref<HTMLInputElement | null>(null)

provide('canvas', canvasRef)

onMounted(async () => {
  const savedLang = localStorage.getItem('lang')
  if (savedLang) locale.value = savedLang as 'en' | 'ar'

  // Lazy-load heavy CAD libs after mount (avoids Rollup issues at build)
  const cadSimple = await import('@mlightcad/cad-simple-viewer')
  const dataModel = await import('@mlightcad/data-model')

  dataModel.registerWorkers({
    dxfParserWorkerUrl:   './assets/dxf-parser-worker.js',
    libredwgParserWorker: './assets/libredwg-parser-worker.js',
    mtextRendererWorker:  './assets/mtext-renderer-worker.js',
  })

  if (!canvasRef.value) return
  cadSimple.AcApDocManager.createInstance(canvasRef.value)

  canvasRef.value.addEventListener('cad:entitySelected', (ev: any) => {
    handleEntityClick(ev.detail?.entity)
  })

  canvasRef.value.addEventListener('click', (ev: MouseEvent) => {
    if (canvasRef.value) handleCanvasClick(ev, canvasRef.value)
  })
})

watch(showFilePicker, (v) => {
  if (v) {
    hiddenInput.value?.click()
    showFilePicker.value = false
  }
})

async function onFile(file: File) {
  await loadFile(file)
}

function onHiddenInput(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (file) loadFile(file)
  ;(ev.target as HTMLInputElement).value = ''
}

async function loadFile(file: File) {
  isLoading.value = true
  errorMsg.value  = ''
  try {
    const buffer = await file.arrayBuffer()
    const data   = new Uint8Array(buffer)
    const ext    = file.name.split('.').pop()?.toLowerCase()

    if (ext !== 'dwg' && ext !== 'dxf') {
      throw new Error(t('error.unsupported'))
    }

    const cadSimple = await import('@mlightcad/cad-simple-viewer')
    const dataModel = await import('@mlightcad/data-model')

    if (ext === 'dwg') {
      dataModel.AcDbDatabaseConverterManager.instance.registerConverter(
        dataModel.AcDbFileType.Dwg,
        () => Promise.resolve(new (cadSimple as any).LibreDWGConverter())
      )
    }

    const ok = await cadSimple.AcApDocManager.instance.openDocument(
      file.name,
      data,
      { minimumChunkSize: 1000, readOnly: true }
    )
    if (!ok) throw new Error(t('error.parseFailed'))

    fileName.value = file.name
    hasFile.value  = true

  } catch (err: any) {
    errorMsg.value = err?.message ?? String(err)
    setTimeout(() => { errorMsg.value = '' }, 6000)
  } finally {
    isLoading.value = false
  }
}
</script>

<style>
*, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
html, body, #app { width: 100%; height: 100%; overflow: hidden; }
</style>

<style scoped>
.app-root {
  position: relative;
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  color: var(--text-primary);
  font-family: system-ui, -apple-system, sans-serif;
  overflow: hidden;
}
.cad-canvas {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.top-bar {
  position: absolute;
  top: 0; left: 0; right: 0;
  height: 48px;
  background: var(--surface);
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 40;
  backdrop-filter: blur(8px);
}
.top-bar-left  { display: flex; align-items: center; gap: 12px; }
.top-bar-right { display: flex; align-items: center; gap: 8px; }
.app-title { font-size: 15px; font-weight: 700; color: var(--accent); }
.file-name { font-size: 13px; color: var(--text-secondary); max-width: 200px;
              overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.icon-btn {
  padding: 6px 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: var(--surface);
  cursor: pointer;
  font-size: 13px;
  color: var(--text-primary);
  transition: background 0.15s;
}
.icon-btn:hover { background: var(--accent-pale); }
.loading-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.55);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  z-index: 200;
  color: #fff;
  font-size: 15px;
}
.spinner {
  width: 40px; height: 40px;
  border: 3px solid rgba(255,255,255,0.3);
  border-top-color: #fff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.error-toast {
  position: absolute;
  bottom: 80px;
  left: 50%;
  transform: translateX(-50%);
  background: #dc2626;
  color: #fff;
  padding: 10px 20px;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  z-index: 300;
  max-width: 90vw;
  text-align: center;
  box-shadow: 0 4px 16px rgba(0,0,0,0.3);
}
.fade-enter-active, .fade-leave-active { transition: opacity 0.25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.3s; }
.slide-up-enter-from, .slide-up-leave-to { transform: translateX(-50%) translateY(20px); opacity: 0; }
</style>
