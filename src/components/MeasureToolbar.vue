<template>
  <div
    class="toolbar"
    :class="{ rtl: dir === 'rtl' }"
  >
    <!-- Tool buttons -->
    <button
      v-for="tool in tools"
      :key="tool.mode"
      class="tool-btn"
      :class="{ active: measureMode === tool.mode }"
      :title="t(tool.key)"
      @click="setMode(tool.mode)"
    >
      <span class="t-icon">{{ tool.icon }}</span>
      <span class="t-label">{{ t(tool.key) }}</span>
    </button>

    <div class="divider" />

    <!-- Unit select -->
    <div class="unit-wrap">
      <label class="unit-label">{{ t('ui.unit') }}</label>
      <select v-model="activeUnit" class="unit-sel">
        <option value="mm">mm</option>
        <option value="cm">cm</option>
        <option value="m">m</option>
        <option value="ft">ft</option>
      </select>
    </div>

    <div class="divider" />

    <!-- Clear all -->
    <button
      class="tool-btn danger"
      :title="t('ui.clearAll')"
      @click="clearResults"
    >
      <span class="t-icon">🗑</span>
      <span class="t-label">{{ t('ui.clear') }}</span>
    </button>

    <!-- Status hint when mode is active -->
    <div v-if="hint" class="status-hint">{{ hint }}</div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  measureMode,
  activeUnit,
  pickedPoints,
  clearResults,
  type MeasureMode,
} from '@/composables/useMeasure'

const { t, locale } = useI18n()
const dir = computed(() => locale.value === 'ar' ? 'rtl' : 'ltr')

const tools: { mode: MeasureMode; icon: string; key: string }[] = [
  { mode: 'none',       icon: '↖️',  key: 'tool.select'     },
  { mode: 'distance',   icon: '📏',  key: 'tool.distance'   },
  { mode: 'area',       icon: '⬛',  key: 'tool.area'       },
  { mode: 'coordinate', icon: '📍',  key: 'tool.coordinate' },
  { mode: 'angle',      icon: '📐',  key: 'tool.angle'      },
]

function setMode(m: MeasureMode) {
  measureMode.value  = measureMode.value === m ? 'none' : m
  pickedPoints.value = []
}

const hint = computed(() => {
  if (measureMode.value === 'distance') {
    return pickedPoints.value.length === 0
      ? t('hint.distFirst')
      : t('hint.distSecond')
  }
  if (measureMode.value === 'area') {
    const n = pickedPoints.value.length
    return n === 0
      ? t('hint.areaStart')
      : t('hint.areaPoints', { n })
  }
  if (measureMode.value === 'angle') {
    const n = pickedPoints.value.length
    if (n === 0) return t('hint.angleFirst')
    if (n === 1) return t('hint.angleVertex')
    return t('hint.angleLast')
  }
  if (measureMode.value === 'coordinate') return t('hint.coord')
  return ''
})
</script>

<style scoped>
.toolbar {
  position: absolute;
  bottom: calc(16px + env(safe-area-inset-bottom));
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  padding: 8px 12px;
  box-shadow: 0 4px 20px var(--shadow);
  z-index: 50;
  flex-wrap: wrap;
  max-width: 95vw;
  backdrop-filter: blur(12px);
}

.tool-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 10px;
  border: 1.5px solid transparent;
  border-radius: 9px;
  background: transparent;
  cursor: pointer;
  color: var(--text-primary);
  transition: all 0.15s;
  min-width: 52px;
}
.tool-btn:hover  { background: var(--accent-pale); border-color: var(--accent); }
.tool-btn.active {
  background: var(--accent-pale);
  border-color: var(--accent);
  color: var(--accent);
}
.tool-btn.danger:hover { background: #fee2e2; border-color: #ef4444; color: #ef4444; }

.t-icon  { font-size: 18px; }
.t-label { font-size: 10px; font-weight: 600; white-space: nowrap; }

.divider {
  width: 1px;
  height: 36px;
  background: var(--border);
  margin: 0 2px;
}

.unit-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}
.unit-label {
  font-size: 10px;
  color: var(--text-secondary);
  font-weight: 600;
}
.unit-sel {
  padding: 5px 6px;
  border-radius: 6px;
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--text-primary);
  font-size: 13px;
  cursor: pointer;
}

.status-hint {
  position: absolute;
  top: -36px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--accent);
  color: #fff;
  padding: 4px 14px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  pointer-events: none;
  box-shadow: 0 2px 8px var(--shadow);
}
</style>
