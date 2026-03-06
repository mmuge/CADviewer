<template>
  <div
    class="drop-zone"
    :class="{ dragover: isDragging }"
    :dir="dir"
    @dragover.prevent="isDragging = true"
    @dragleave.prevent="isDragging = false"
    @drop.prevent="onDrop"
  >
    <div class="drop-inner">
      <!-- Animated icon -->
      <div class="icon-wrap" :class="{ pulse: isDragging }">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none"
             stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
          <polyline points="13 2 13 9 20 9"/>
          <line x1="9" y1="14" x2="15" y2="14"/>
          <line x1="9" y1="17" x2="13" y2="17"/>
        </svg>
      </div>

      <h1 class="drop-title">{{ t('drop.title') }}</h1>
      <p  class="drop-sub">{{ t('drop.sub') }}</p>

      <!-- File input (works on iPhone via Files.app) -->
      <input
        ref="fileInput"
        type="file"
        accept=".dwg,.dxf"
        style="display:none"
        @change="onInputChange"
      />

      <button class="open-btn" @click="fileInput?.click()">
        {{ t('drop.browse') }}
      </button>

      <p class="drop-hint">🔒 {{ t('drop.hint') }}</p>

      <!-- Supported formats badge -->
      <div class="format-badges">
        <span class="badge">DWG R14–2018</span>
        <span class="badge">DXF ASCII</span>
        <span class="badge">Offline</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'

const emit = defineEmits<{ (e: 'file', f: File): void }>()
const { t, locale } = useI18n()

const dir       = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')
const isDragging = ref(false)
const fileInput  = ref<HTMLInputElement | null>(null)

function onDrop(ev: DragEvent) {
  isDragging.value = false
  const file = ev.dataTransfer?.files[0]
  if (file) validate(file)
}

function onInputChange(ev: Event) {
  const file = (ev.target as HTMLInputElement).files?.[0]
  if (file) validate(file)
}

function validate(file: File) {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext !== 'dwg' && ext !== 'dxf') {
    alert(t('error.unsupported'))
    return
  }
  emit('file', file)
}
</script>

<style scoped>
.drop-zone {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-primary);
  z-index: 20;
  transition: background 0.2s;
}
.drop-zone.dragover {
  background: var(--accent-pale);
}
.drop-zone.dragover .icon-wrap {
  color: var(--accent);
  transform: scale(1.12);
}

.drop-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 14px;
  padding: 40px 32px;
  text-align: center;
  color: var(--text-secondary);
  max-width: 420px;
}

.icon-wrap {
  color: var(--accent);
  transition: transform 0.25s, color 0.25s;
}
.icon-wrap.pulse {
  animation: pulse 0.8s ease-in-out infinite alternate;
}
@keyframes pulse {
  from { opacity: 0.7; transform: scale(1); }
  to   { opacity: 1;   transform: scale(1.1); }
}

.drop-title {
  font-size: 22px;
  font-weight: 700;
  color: var(--text-primary);
  margin-top: 4px;
}
.drop-sub {
  font-size: 14px;
  color: var(--text-secondary);
}

.open-btn {
  margin-top: 4px;
  padding: 12px 32px;
  background: var(--accent);
  color: #fff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.15s, transform 0.1s;
  box-shadow: 0 4px 14px var(--shadow);
}
.open-btn:hover  { background: var(--accent-hover); }
.open-btn:active { transform: scale(0.97); }

.drop-hint {
  font-size: 12px;
  opacity: 0.55;
}

.format-badges {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  margin-top: 4px;
}
.badge {
  padding: 3px 10px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  color: var(--text-secondary);
}
</style>
