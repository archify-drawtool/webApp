<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface ArucoCorner {
  position: 'top_left' | 'top_right' | 'bottom_right' | 'bottom_left'
  x: number
  y: number
}

interface ArucoPoint {
  x: number
  y: number
}

interface ArucoMarker {
  id: number
  marker_id: number
  center_x: number
  center_y: number
  ocr_text: string | null
  corners: ArucoCorner[]
  hitbox_corners: ArucoPoint[]
}

interface CorridorSide {
  origin: ArucoPoint
  far_start: ArucoPoint
  far_end: ArucoPoint
}

interface ArucoEdge {
  id: number
  detection_lines: {
    main_start: ArucoPoint
    main_end: ArucoPoint
    upper: CorridorSide
    lower: CorridorSide
  }
}

interface ArucoData {
  markers: ArucoMarker[]
  edges: ArucoEdge[]
}

const props = defineProps<{
  src: string | null
  loading?: boolean
  error?: string | null
  arucoData?: unknown
}>()

const emit = defineEmits<{ close: [] }>()

const imgEl = ref<HTMLImageElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)

const aruco = computed(() => props.arucoData as ArucoData | null | undefined)

function onImgLoad() {
  if (imgEl.value) {
    naturalW.value = imgEl.value.naturalWidth
    naturalH.value = imgEl.value.naturalHeight
  }
}

const showMarkers = ref(true)
const showHitboxes = ref(true)
const showEdges = ref(true)

function toPoints(pts: ArucoPoint[]) {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/80 p-6"
      @click.self="emit('close')"
    >
      <button
        type="button"
        class="absolute top-4 right-4 text-white hover:text-primary-300 transition-colors"
        aria-label="Sluiten"
        @click="emit('close')"
      >
        <X :size="28" />
      </button>

      <div class="max-w-full max-h-full flex flex-col items-center gap-3">
        <span v-if="loading" class="text-grey-200 text-sm">Foto laden...</span>
        <p v-else-if="error" class="text-error-text text-sm px-6 text-center">{{ error }}</p>
        <template v-else-if="src">
          <!-- Toggle controls -->
          <div v-if="aruco" class="flex items-center gap-2 self-start">
            <button
              type="button"
              class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
              :class="showMarkers ? 'border-white text-white' : 'border-secondary-700 text-grey-500'"
              @click="showMarkers = !showMarkers"
            >
              Markers
            </button>
            <button
              type="button"
              class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
              :class="showHitboxes ? 'border-orange-400 text-orange-400' : 'border-secondary-700 text-grey-500'"
              @click="showHitboxes = !showHitboxes"
            >
              Hitboxes
            </button>
            <button
              type="button"
              class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
              :class="showEdges ? 'border-blue-400 text-blue-400' : 'border-secondary-700 text-grey-500'"
              @click="showEdges = !showEdges"
            >
              Detectielijnen
            </button>
          </div>

          <!-- Photo with SVG overlay -->
          <div class="relative inline-block">
            <img
              ref="imgEl"
              :src="src"
              alt="Originele foto"
              class="max-w-[90vw] max-h-[85vh] object-contain shadow-xl block"
              @load="onImgLoad"
            >
            <svg
              v-if="aruco && naturalW"
              class="absolute inset-0 w-full h-full pointer-events-none"
              :viewBox="`0 0 ${naturalW} ${naturalH}`"
              preserveAspectRatio="xMidYMid meet"
            >
              <!-- Marker corners + labels -->
              <g v-if="showMarkers">
                <g v-for="m in aruco.markers" :key="`marker-${m.id}`">
                  <polygon
                    :points="toPoints(m.corners)"
                    fill="none"
                    stroke="white"
                    stroke-width="9"
                  />
                  <text
                    :x="m.center_x"
                    :y="m.center_y - 8"
                    text-anchor="middle"
                    dominant-baseline="auto"
                    fill="white"
                    font-size="28"
                    font-weight="bold"
                    paint-order="stroke"
                    stroke="black"
                    stroke-width="6"
                  >{{ m.marker_id }}</text>
                  <text
                    v-if="m.ocr_text"
                    :x="m.center_x"
                    :y="m.center_y + 28"
                    text-anchor="middle"
                    dominant-baseline="auto"
                    fill="#4ade80"
                    font-size="24"
                    paint-order="stroke"
                    stroke="black"
                    stroke-width="6"
                  >{{ m.ocr_text }}</text>
                </g>
              </g>

              <!-- Hitbox (OCR crop) outlines -->
              <g v-if="showHitboxes">
                <polygon
                  v-for="m in aruco.markers"
                  :key="`hitbox-${m.id}`"
                  :points="toPoints(m.hitbox_corners)"
                  fill="none"
                  stroke="#fb923c"
                  stroke-width="6"
                  stroke-dasharray="16 8"
                />
              </g>

              <!-- Edge detection corridors -->
              <g v-if="showEdges">
                <g v-for="e in aruco.edges" :key="`edge-${e.id}`">
                  <!-- Main detection axis -->
                  <line
                    :x1="e.detection_lines.main_start.x"
                    :y1="e.detection_lines.main_start.y"
                    :x2="e.detection_lines.main_end.x"
                    :y2="e.detection_lines.main_end.y"
                    stroke="#60a5fa"
                    stroke-width="6"
                  />
                  <!-- Perpendicular indicator (upper.origin → lower.origin) -->
                  <line
                    :x1="e.detection_lines.upper.origin.x"
                    :y1="e.detection_lines.upper.origin.y"
                    :x2="e.detection_lines.lower.origin.x"
                    :y2="e.detection_lines.lower.origin.y"
                    stroke="#60a5fa"
                    stroke-width="6"
                  />
                  <!-- Upper corridor boundaries -->
                  <line
                    :x1="e.detection_lines.upper.origin.x"
                    :y1="e.detection_lines.upper.origin.y"
                    :x2="e.detection_lines.upper.far_start.x"
                    :y2="e.detection_lines.upper.far_start.y"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="8 6"
                    opacity="0.7"
                  />
                  <line
                    :x1="e.detection_lines.upper.origin.x"
                    :y1="e.detection_lines.upper.origin.y"
                    :x2="e.detection_lines.upper.far_end.x"
                    :y2="e.detection_lines.upper.far_end.y"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="8 6"
                    opacity="0.7"
                  />
                  <!-- Lower corridor boundaries -->
                  <line
                    :x1="e.detection_lines.lower.origin.x"
                    :y1="e.detection_lines.lower.origin.y"
                    :x2="e.detection_lines.lower.far_start.x"
                    :y2="e.detection_lines.lower.far_start.y"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="8 6"
                    opacity="0.7"
                  />
                  <line
                    :x1="e.detection_lines.lower.origin.x"
                    :y1="e.detection_lines.lower.origin.y"
                    :x2="e.detection_lines.lower.far_end.x"
                    :y2="e.detection_lines.lower.far_end.y"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="8 6"
                    opacity="0.7"
                  />
                </g>
              </g>
            </svg>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>
