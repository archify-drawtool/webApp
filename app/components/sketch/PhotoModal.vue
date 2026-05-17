<script setup lang="ts">
import { X } from 'lucide-vue-next'

interface ArucoCorner {
  x: number
  y: number
}

interface DetectionLine {
  x1: number
  y1: number
  x2: number
  y2: number
}

interface ArucoMarker {
  id: number
  corners: ArucoCorner[]
  hitbox_corners: ArucoCorner[]
}

interface ArucoEdge {
  id: number
  detection_lines: {
    center: DetectionLine
    upper: DetectionLine
    lower: DetectionLine
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

function cornersToPoints(corners: ArucoCorner[]) {
  return corners.map(c => `${c.x},${c.y}`).join(' ')
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
              :class="showMarkers ? 'border-green-400 text-green-400' : 'border-secondary-700 text-grey-500'"
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
              <!-- Marker squares (solid) -->
              <g v-if="showMarkers">
                <polygon
                  v-for="m in aruco.markers"
                  :key="`marker-${m.id}`"
                  :points="cornersToPoints(m.corners)"
                  fill="none"
                  stroke="#4ade80"
                  stroke-width="9"
                />
              </g>

              <!-- Hitbox outlines (dashed) -->
              <g v-if="showHitboxes">
                <polygon
                  v-for="m in aruco.markers"
                  :key="`hitbox-${m.id}`"
                  :points="cornersToPoints(m.hitbox_corners)"
                  fill="none"
                  stroke="#fb923c"
                  stroke-width="6"
                  stroke-dasharray="10 5"
                />
              </g>

              <!-- Edge detection lines -->
              <g v-if="showEdges">
                <g v-for="e in aruco.edges" :key="`edge-${e.id}`">
                  <line
                    :x1="e.detection_lines.center.x1"
                    :y1="e.detection_lines.center.y1"
                    :x2="e.detection_lines.center.x2"
                    :y2="e.detection_lines.center.y2"
                    stroke="#60a5fa"
                    stroke-width="6"
                  />
                  <line
                    :x1="e.detection_lines.upper.x1"
                    :y1="e.detection_lines.upper.y1"
                    :x2="e.detection_lines.upper.x2"
                    :y2="e.detection_lines.upper.y2"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="6 4"
                    opacity="0.6"
                  />
                  <line
                    :x1="e.detection_lines.lower.x1"
                    :y1="e.detection_lines.lower.y1"
                    :x2="e.detection_lines.lower.x2"
                    :y2="e.detection_lines.lower.y2"
                    stroke="#60a5fa"
                    stroke-width="3"
                    stroke-dasharray="6 4"
                    opacity="0.6"
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
