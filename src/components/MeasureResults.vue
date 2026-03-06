<template>
  <transition name="panel-slide">
    <div
      v-if="results.length"
      class="results-panel"
      :class="{ rtl: dir === 'rtl', collapsed: isCollapsed }"
    >
      <!-- Header -->
      <div class="panel-head">
        <button class="collapse-btn" @click="isCollapsed = !isCollapsed">
          {{ isCollapsed ? '▼' : '▲' }}
        </button>
        <span class="panel-title">
          {{ t('results.title') }}
          <span class="count-badge">{{ results.length }}</span>
        </span>
        <div class="head-actions">
          <button class="action-btn" :title="t('results.copyAll')" @click="doCopy">
            📋
          </button>
          <button class="action-btn" :title="t('results.exportCSV')" @click="doCSV">
            📄 CSV
          </button>
          <button class="action-btn" :title="t('results.exportPDF')" @click="doPDF">
            🖨 PDF
          </button>
        </div>
      </div>

      <!-- Copy confirmation toast -->
      <div v-if="copied" class="copy-toast">✅ {{ t('results.copied') }}</div>

      <!-- Result list -->
      <transition name="expand">
        <ul v-if="!isCollapsed" class="result-list">
          <li
            v-for="r in results"
            :key="r.id"
            class="result-item"
          >
            <span class="mode-pill" :class="`pill-${r.mode}`">
              {{ t(`tool.${r.mode}`) }}
            </span>
            <span class="result-val">{{ r.label }}</span>
            <span class="result-time">{{ r.timestamp }}</span>
            <button class="del-btn" @click="removeResult(r.id)">×</button>
          </li>
        </ul>
      </transition>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { results, removeResult } from '@/composables/useMeasure'
import { exportCSV, exportPDF, copyText } from '@/composables/useExport'

defineProps<{ fileName: string }>()

const { t, locale } = useI18n()
const dir         = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')
const isCollapsed = ref(false)
const copied      = ref(false)

async function doCopy() {
  await copyText(results.value)
  copied.value = true
  setTimeout(() => { copied.value = false }, 2000)
}
function doCSV() { exportCSV(results.value) }
function doPDF() { exportPDF(results.value) }
</script>

<style scoped>
.results-panel {
  position: absolute;
  top: 56px;
  right: 12px;
  width: 310px;
  max-height: calc(100vh - 140px);
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px var(--shadow);
  z-index: 50;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(12px);
}
.results-panel.rtl { right: auto; left: 12px; }

/* header */
.panel-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
  background: var(--bg-secondary);
  flex-shrink: 0;
}
.collapse-btn {
  background: none; border: none; cursor: pointer;
  font-size: 11px; color: var(--text-secondary);
  padding: 2px 4px;
}
.panel-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--text-primary);
  flex: 1;
  display: flex;
  align-items: center;
  gap: 6px;
}
.count-badge {
  background: var(--accent);
  color: #fff;
  font-size: 11px;
  padding: 1px 7px;
  border-radius: 20px;
}
.head-actions { display: flex; gap: 4px; }
.action-btn {
  padding: 4px 8px;
  background: var(--bg-primary);
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  font-size: 11px;
  color: var(--text-primary);
  white-space: nowrap;
  transition: background 0.15s;
}
.action-btn:hover { background: var(--accent-pale); }

/* copy toast */
.copy-toast {
  text-align: center;
  padding: 4px;
  font-size: 12px;
  color: #15803d;
  background: #dcfce7;
  border-bottom: 1px solid var(--border);
}

/* list */
.result-list {
  list-style: none;
  overflow-y: auto;
  max-height: calc(100vh - 220px);
}
.result-item {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 8px 12px;
  border-bottom: 1px solid var(--border);
  font-size: 12px;
}
.result-item:last-child { border-bottom: none; }

.mode-pill {
  flex-shrink: 0;
  padding: 2px 8px;
  border-radius: 20px;
  font-size: 10px;
  font-weight: 700;
  white-space: nowrap;
}
.pill-distance   { background: #dbeafe; color: #1d4ed8; }
.pill-area       { background: #dcfce7; color: #15803d; }
.pill-coordinate { background: #fef3c7; color: #b45309; }
.pill-angle      { background: #ede9fe; color: #7c3aed; }

.result-val  { flex: 1; font-family: monospace; font-size: 12px; }
.result-time { font-size: 10px; color: var(--text-secondary); white-space: nowrap; }
.del-btn {
  border: none;
  background: none;
  cursor: pointer;
  font-size: 16px;
  opacity: 0.35;
  line-height: 1;
  padding: 0 2px;
  transition: opacity 0.15s;
}
.del-btn:hover { opacity: 0.8; }

/* Transitions */
.panel-slide-enter-active,
.panel-slide-leave-active { transition: all 0.25s; }
.panel-slide-enter-from,
.panel-slide-leave-to { opacity: 0; transform: translateX(20px); }

.expand-enter-active,
.expand-leave-active { transition: max-height 0.25s ease; overflow: hidden; }
.expand-enter-from,
.expand-leave-to { max-height: 0; }
.expand-enter-to,
.expand-leave-from { max-height: 600px; }
</style>
