<template>
  <div
    v-if="measureMode !== 'none' && cursorWorld"
    class="cursor-coord"
    :style="{ left: pos.x + 'px', top: pos.y + 'px' }"
  >
    <span class="coord-row"><b>X</b> {{ cursorWorld.x.toFixed(3) }}</span>
    <span class="coord-row"><b>Y</b> {{ cursorWorld.y.toFixed(3) }}</span>
    <span v-if="cursorWorld.z !== 0" class="coord-row"><b>Z</b> {{ cursorWorld.z.toFixed(3) }}</span>
    <span v-if="pickedPoints.length > 0" class="pick-hint">
      {{ pickedPoints.length }} {{ t('ui.pointsPicked') }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { ref, inject, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import type { Ref } from 'vue'
import { measureMode, pickedPoints, screenToWorld, type WorldPoint } from '@/composables/useMeasure'

defineProps<{ canvas: HTMLCanvasElement | null }>()
const { t } = useI18n()

// Injected canvas ref from App.vue
const canvasRef = inject<Ref<HTMLCanvasElement | null>>('canvas')

const cursorWorld = ref<WorldPoint | null>(null)
const pos         = ref({ x: 0, y: 0 })

function onMove(ev: MouseEvent) {
  if (measureMode.value === 'none') return
  pos.value = { x: ev.clientX + 16, y: ev.clientY - 10 }
  const c = canvasRef?.value
  if (c) cursorWorld.value = screenToWorld(ev.clientX, ev.clientY, c)
}

function onTouchMove(ev: TouchEvent) {
  if (measureMode.value === 'none') return
  const t0 = ev.touches[0]
  pos.value = { x: t0.clientX + 16, y: t0.clientY - 40 }
  const c = canvasRef?.value
  if (c) cursorWorld.value = screenToWorld(t0.clientX, t0.clientY, c)
}

onMounted(() => {
  window.addEventListener('mousemove', onMove)
  window.addEventListener('touchmove', onTouchMove, { passive: true })
})
onUnmounted(() => {
  window.removeEventListener('mousemove', onMove)
  window.removeEventListener('touchmove', onTouchMove)
})
</script>

<style scoped>
.cursor-coord {
  position: fixed;
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 7px 11px;
  background: rgba(0, 0, 0, 0.78);
  color: #fff;
  border-radius: 7px;
  font-family: monospace;
  font-size: 12px;
  pointer-events: none;
  z-index: 200;
  backdrop-filter: blur(4px);
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
  transition: left 0.05s, top 0.05s;
}
.coord-row { display: flex; gap: 6px; }
.coord-row b { color: #93c5fd; min-width: 14px; }
.pick-hint {
  margin-top: 4px;
  font-size: 10px;
  color: #fcd34d;
  border-top: 1px solid rgba(255,255,255,0.15);
  padding-top: 3px;
}
</style>
