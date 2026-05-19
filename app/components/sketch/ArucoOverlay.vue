<script setup lang="ts">
import type { ArucoData, ArucoPoint } from '~/types/ArucoDetection'

const props = defineProps<{
  src: string
  arucoData: ArucoData
}>()

const imgEl = ref<HTMLImageElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)

const showMarkers = ref(true)
const showHitboxes = ref(true)
const showEdges = ref(true)

function onImgLoad() {
  if (imgEl.value) {
    naturalW.value = imgEl.value.naturalWidth
    naturalH.value = imgEl.value.naturalHeight
  }
}

function toPoints(pts: ArucoPoint[]) {
  return pts.map(p => `${p.x},${p.y}`).join(' ')
}
</script>

<template>
  <div class="flex flex-col items-center gap-3">
    <!-- Toggle controls -->
    <div class="flex items-center gap-2 self-start">
      <button
        type="button"
        class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
        :class="showMarkers ? 'border-aruco-marker text-aruco-marker' : 'border-secondary-700 text-grey-500'"
        @click="showMarkers = !showMarkers"
      >
        Markers
      </button>
      <button
        type="button"
        class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
        :class="showHitboxes ? 'border-aruco-hitbox text-aruco-hitbox' : 'border-secondary-700 text-grey-500'"
        @click="showHitboxes = !showHitboxes"
      >
        Hitboxes
      </button>
      <button
        type="button"
        class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
        :class="showEdges ? 'border-aruco-edge text-aruco-edge' : 'border-secondary-700 text-grey-500'"
        @click="showEdges = !showEdges"
      >
        Detectielijnen
      </button>
    </div>

    <!-- Photo with SVG overlay -->
    <div class="relative inline-block">
      <img
        ref="imgEl"
        :src="props.src"
        alt="Originele foto"
        class="max-w-[90vw] max-h-[85vh] object-contain shadow-xl block"
        @load="onImgLoad"
      >
      <svg
        v-if="naturalW"
        class="absolute inset-0 w-full h-full pointer-events-none"
        :viewBox="`0 0 ${naturalW} ${naturalH}`"
        preserveAspectRatio="xMidYMid meet"
      >
        <!-- Marker corners + labels -->
        <g v-if="showMarkers">
          <g v-for="m in props.arucoData.markers" :key="`marker-${m.id}`">
            <polygon
              :points="toPoints(m.corners)"
              fill="none"
              class="stroke-aruco-marker"
              stroke-width="9"
            />
            <text
              :x="m.center_x"
              :y="m.center_y - 8"
              text-anchor="middle"
              dominant-baseline="auto"
              class="fill-aruco-marker"
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
            v-for="m in props.arucoData.markers"
            :key="`hitbox-${m.id}`"
            :points="toPoints(m.hitbox_corners)"
            fill="none"
            class="stroke-aruco-hitbox"
            stroke-width="6"
            stroke-dasharray="16 8"
          />
        </g>

        <!-- Edge detection corridors -->
        <g v-if="showEdges">
          <g v-for="e in props.arucoData.edges" :key="`edge-${e.id}`">
            <!-- Main detection axis -->
            <line
              :x1="e.detection_lines.main_start.x"
              :y1="e.detection_lines.main_start.y"
              :x2="e.detection_lines.main_end.x"
              :y2="e.detection_lines.main_end.y"
              class="stroke-aruco-edge"
              stroke-width="6"
            />
            <!-- Perpendicular indicator (upper.origin → lower.origin) -->
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.lower.origin.x"
              :y2="e.detection_lines.lower.origin.y"
              class="stroke-aruco-edge"
              stroke-width="6"
            />
            <!-- Upper corridor boundaries -->
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.upper.far_start.x"
              :y2="e.detection_lines.upper.far_start.y"
              class="stroke-aruco-edge"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.upper.far_end.x"
              :y2="e.detection_lines.upper.far_end.y"
              class="stroke-aruco-edge"
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
              class="stroke-aruco-edge"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
            <line
              :x1="e.detection_lines.lower.origin.x"
              :y1="e.detection_lines.lower.origin.y"
              :x2="e.detection_lines.lower.far_end.x"
              :y2="e.detection_lines.lower.far_end.y"
              class="stroke-aruco-edge"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
          </g>
        </g>
      </svg>
    </div>
  </div>
</template>
