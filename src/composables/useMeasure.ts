import { ref } from 'vue'
import { AcApDocManager } from '@mlightcad/cad-simple-viewer'
import { AcDbCircle, AcDbLwPolyline, AcDbLine } from '@mlightcad/data-model'

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════
export type MeasureMode = 'none' | 'distance' | 'area' | 'coordinate' | 'angle'

export interface WorldPoint {
  x: number
  y: number
  z: number
}

export interface MeasureResult {
  id:        string
  mode:      MeasureMode
  label:     string
  value:     number
  unit:      string
  points:    WorldPoint[]
  timestamp: string
}

export type UnitKey = 'mm' | 'cm' | 'm' | 'ft'

// ═══════════════════════════════════════════════════════════════
// Reactive state (module-level singletons)
// ═══════════════════════════════════════════════════════════════
export const measureMode   = ref<MeasureMode>('none')
export const pickedPoints  = ref<WorldPoint[]>([])
export const results       = ref<MeasureResult[]>([])
export const activeUnit    = ref<UnitKey>('m')

let _counter = 0

// ═══════════════════════════════════════════════════════════════
// Unit helpers
// ═══════════════════════════════════════════════════════════════

/** Drawing units are assumed to be mm (AutoCAD default). Adjust if needed. */
const DRAW_UNIT_TO_MM = 1

function toDisplay(mm: number): number {
  switch (activeUnit.value) {
    case 'mm': return mm
    case 'cm': return mm / 10
    case 'm':  return mm / 1000
    case 'ft': return mm / 304.8
  }
}

function distSuffix(): string {
  return { mm: 'mm', cm: 'cm', m: 'm', ft: 'ft' }[activeUnit.value]
}

function areaSuffix(): string {
  return { mm: 'mm²', cm: 'cm²', m: 'm²', ft: 'ft²' }[activeUnit.value]
}

function convertArea(mm2: number): number {
  switch (activeUnit.value) {
    case 'mm': return mm2
    case 'cm': return mm2 / 100
    case 'm':  return mm2 / 1_000_000
    case 'ft': return mm2 / 92_903.04
  }
}

// ═══════════════════════════════════════════════════════════════
// Coordinate conversion: screen pixel → CAD world
// ═══════════════════════════════════════════════════════════════
export function screenToWorld(
  clientX: number,
  clientY: number,
  canvas: HTMLCanvasElement
): WorldPoint | null {
  const manager = AcApDocManager.instance
  if (!manager) return null

  // Access internal viewer (Three.js wrapper)
  const viewer = (manager as any)._viewer ?? (manager as any).viewer
  if (!viewer) return null

  const camera   = viewer.camera   // THREE.OrthographicCamera
  if (!camera) return null

  const rect = canvas.getBoundingClientRect()
  const nx   = ((clientX - rect.left)  / rect.width)  * 2 - 1
  const ny   = -((clientY - rect.top) / rect.height) * 2 + 1

  // Orthographic: world XY = camera frustum offset + NDC scaled
  const halfW = (camera.right - camera.left)   / 2
  const halfH = (camera.top   - camera.bottom) / 2
  const cx    = (camera.right + camera.left)   / 2
  const cy    = (camera.top   + camera.bottom) / 2

  return {
    x: cx + nx * halfW,
    y: cy + ny * halfH,
    z: 0,
  }
}

// ═══════════════════════════════════════════════════════════════
// Geometry math
// ═══════════════════════════════════════════════════════════════
export function computeDistance(a: WorldPoint, b: WorldPoint): number {
  const dx = (b.x - a.x) * DRAW_UNIT_TO_MM
  const dy = (b.y - a.y) * DRAW_UNIT_TO_MM
  const dz = (b.z - a.z) * DRAW_UNIT_TO_MM
  return Math.sqrt(dx * dx + dy * dy + dz * dz)
}

export function computeAngle(a: WorldPoint, vertex: WorldPoint, b: WorldPoint): number {
  const v1 = { x: a.x - vertex.x, y: a.y - vertex.y }
  const v2 = { x: b.x - vertex.x, y: b.y - vertex.y }
  const dot   = v1.x * v2.x + v1.y * v2.y
  const cross = v1.x * v2.y - v1.y * v2.x
  return (Math.atan2(Math.abs(cross), dot) * 180) / Math.PI
}

export function computePolygonAreaMm2(pts: WorldPoint[]): number {
  if (pts.length < 3) return 0
  let sum = 0
  for (let i = 0; i < pts.length; i++) {
    const j = (i + 1) % pts.length
    sum += pts[i].x * pts[j].y - pts[j].x * pts[i].y
  }
  return Math.abs(sum) / 2
}

// ═══════════════════════════════════════════════════════════════
// Entity-based area extraction
// ═══════════════════════════════════════════════════════════════
export function entityArea(entity: unknown): number | null {
  if (entity instanceof AcDbCircle) {
    const r = (entity as any).radius as number
    return convertArea(Math.PI * r * r)
  }
  if (entity instanceof AcDbLwPolyline) {
    const e = entity as any
    if (!e.isClosed) return null
    const pts: WorldPoint[] = []
    for (let i = 0; i < e.numVerts; i++) {
      const p = e.getPointAt(i)
      pts.push({ x: p.x, y: p.y, z: 0 })
    }
    return convertArea(computePolygonAreaMm2(pts))
  }
  return null
}

// ═══════════════════════════════════════════════════════════════
// Main interaction handlers
// ═══════════════════════════════════════════════════════════════
export function handleCanvasClick(ev: MouseEvent, canvas: HTMLCanvasElement) {
  if (measureMode.value === 'none') return

  const wp = screenToWorld(ev.clientX, ev.clientY, canvas)
  if (!wp) return

  // ── Coordinate mode: single tap ─────────────────────────────
  if (measureMode.value === 'coordinate') {
    addResult({
      mode:   'coordinate',
      label:  `X: ${wp.x.toFixed(4)}, Y: ${wp.y.toFixed(4)}, Z: ${wp.z.toFixed(4)}`,
      value:  0,
      unit:   '',
      points: [wp],
    })
    return
  }

  // ── Distance mode: two points ────────────────────────────────
  if (measureMode.value === 'distance') {
    pickedPoints.value.push(wp)
    if (pickedPoints.value.length === 2) {
      const [a, b] = pickedPoints.value
      const distMm = computeDistance(a, b)
      const disp   = toDisplay(distMm)
      addResult({
        mode:   'distance',
        label:  `${disp.toFixed(4)} ${distSuffix()}`,
        value:  disp,
        unit:   distSuffix(),
        points: [...pickedPoints.value],
      })
      pickedPoints.value = []
    }
    return
  }

  // ── Angle mode: three points (a, vertex, b) ───────────────────
  if (measureMode.value === 'angle') {
    pickedPoints.value.push(wp)
    if (pickedPoints.value.length === 3) {
      const [a, vertex, b] = pickedPoints.value
      const deg = computeAngle(a, vertex, b)
      addResult({
        mode:   'angle',
        label:  `${deg.toFixed(2)}°`,
        value:  deg,
        unit:   '°',
        points: [...pickedPoints.value],
      })
      pickedPoints.value = []
    }
    return
  }

  // ── Area mode: polygon (click to add, close when near start or 20+ pts) ──
  if (measureMode.value === 'area') {
    pickedPoints.value.push(wp)
    if (pickedPoints.value.length >= 3) {
      const first = pickedPoints.value[0]
      const snapPx = 20 / 1  // approximate world units threshold
      const closeEnough =
        Math.hypot(first.x - wp.x, first.y - wp.y) < snapPx ||
        pickedPoints.value.length >= 25

      if (closeEnough) {
        pickedPoints.value.pop() // remove duplicate close point
        const areaMm2 = computePolygonAreaMm2(pickedPoints.value)
        const area    = convertArea(areaMm2)
        addResult({
          mode:   'area',
          label:  `${area.toFixed(4)} ${areaSuffix()}`,
          value:  area,
          unit:   areaSuffix(),
          points: [...pickedPoints.value],
        })
        pickedPoints.value = []
      }
    }
  }
}

export function handleEntityClick(entity: unknown) {
  if (measureMode.value !== 'area' || !entity) return
  const area = entityArea(entity)
  if (area === null) return
  addResult({
    mode:   'area',
    label:  `${area.toFixed(4)} ${areaSuffix()}`,
    value:  area,
    unit:   areaSuffix(),
    points: [],
  })
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════
function addResult(r: Omit<MeasureResult, 'id' | 'timestamp'>) {
  results.value.unshift({
    ...r,
    id:        `m-${++_counter}`,
    timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
  })
}

export function removeResult(id: string) {
  const i = results.value.findIndex(r => r.id === id)
  if (i >= 0) results.value.splice(i, 1)
}

export function clearResults() {
  results.value      = []
  pickedPoints.value = []
}
