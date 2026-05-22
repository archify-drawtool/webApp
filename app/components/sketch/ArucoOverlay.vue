<script setup lang="ts">
import type { ArucoData, ArucoPoint } from '~/types/ArucoDetection'

const props = defineProps<{
  src: string
  arucoData: ArucoData
}>()

const imgEl = ref<HTMLImageElement | null>(null)
const naturalW = ref(0)
const naturalH = ref(0)

const showNodeMarkers = ref(true)
const showNodeHitboxes = ref(true)
const showEdgeMarkers = ref(true)
const showEdgeHitboxes = ref(true)
const showDetectionLines = ref(true)
const showFailedEdges = ref(true)

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
    <div class="flex items-center gap-4 self-start flex-wrap">
      <!-- Node toggles -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-grey-500 font-heading font-bold uppercase tracking-wide">Nodes</span>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showNodeMarkers ? 'border-aruco-marker text-aruco-marker' : 'border-secondary-700 text-grey-500'"
          @click="showNodeMarkers = !showNodeMarkers"
        >
          Markers
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showNodeHitboxes ? 'border-aruco-hitbox text-aruco-hitbox' : 'border-secondary-700 text-grey-500'"
          @click="showNodeHitboxes = !showNodeHitboxes"
        >
          Hitboxes
        </button>
      </div>
      <!-- Edge toggles -->
      <div class="flex items-center gap-2">
        <span class="text-xs text-grey-500 font-heading font-bold uppercase tracking-wide">Edges</span>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showEdgeMarkers ? 'border-aruco-marker text-aruco-marker' : 'border-secondary-700 text-grey-500'"
          @click="showEdgeMarkers = !showEdgeMarkers"
        >
          Markers
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showEdgeHitboxes ? 'border-aruco-hitbox text-aruco-hitbox' : 'border-secondary-700 text-grey-500'"
          @click="showEdgeHitboxes = !showEdgeHitboxes"
        >
          Hitboxes
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showDetectionLines ? 'border-aruco-edge text-aruco-edge' : 'border-secondary-700 text-grey-500'"
          @click="showDetectionLines = !showDetectionLines"
        >
          Detectielijnen
        </button>
        <button
          type="button"
          class="px-3 py-1 text-xs font-heading font-bold border transition-colors"
          :class="showFailedEdges ? 'border-aruco-edge-failed text-aruco-edge-failed' : 'border-secondary-700 text-grey-500'"
          @click="showFailedEdges = !showFailedEdges"
        >
          Mislukt
        </button>
      </div>
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
        <!-- Node marker corners + labels -->
        <g v-if="showNodeMarkers">
          <g v-for="m in props.arucoData.node_markers" :key="`node-marker-${m.id}`">
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

        <!-- Node hitbox (OCR crop) outlines -->
        <g v-if="showNodeHitboxes">
          <polygon
            v-for="m in props.arucoData.node_markers"
            :key="`node-hitbox-${m.id}`"
            :points="toPoints(m.hitbox_corners)"
            fill="none"
            class="stroke-aruco-hitbox"
            stroke-width="6"
            stroke-dasharray="16 8"
          />
        </g>

        <!-- Edge marker corners + labels -->
        <g v-if="showEdgeMarkers">
          <g v-for="m in props.arucoData.edge_markers" :key="`edge-marker-${m.id}`">
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

        <!-- Edge hitbox outlines -->
        <g v-if="showEdgeHitboxes">
          <polygon
            v-for="m in props.arucoData.edge_markers"
            :key="`edge-hitbox-${m.id}`"
            :points="toPoints(m.hitbox_corners)"
            fill="none"
            class="stroke-aruco-hitbox"
            stroke-width="6"
            stroke-dasharray="16 8"
          />
        </g>

        <!-- Edge detection corridors (detected) -->
        <g v-if="showDetectionLines">
          <g v-for="e in props.arucoData.edge_markers.filter(m => m.is_detected)" :key="`detection-${e.id}`">
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

        <!-- Edge detection corridors (failed / not detected) -->
        <g v-if="showFailedEdges">
          <g v-for="e in props.arucoData.edge_markers.filter(m => !m.is_detected)" :key="`failed-${e.id}`">
            <line
              :x1="e.detection_lines.main_start.x"
              :y1="e.detection_lines.main_start.y"
              :x2="e.detection_lines.main_end.x"
              :y2="e.detection_lines.main_end.y"
              class="stroke-aruco-edge-failed"
              stroke-width="6"
            />
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.lower.origin.x"
              :y2="e.detection_lines.lower.origin.y"
              class="stroke-aruco-edge-failed"
              stroke-width="6"
            />
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.upper.far_start.x"
              :y2="e.detection_lines.upper.far_start.y"
              class="stroke-aruco-edge-failed"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
            <line
              :x1="e.detection_lines.upper.origin.x"
              :y1="e.detection_lines.upper.origin.y"
              :x2="e.detection_lines.upper.far_end.x"
              :y2="e.detection_lines.upper.far_end.y"
              class="stroke-aruco-edge-failed"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
            <line
              :x1="e.detection_lines.lower.origin.x"
              :y1="e.detection_lines.lower.origin.y"
              :x2="e.detection_lines.lower.far_start.x"
              :y2="e.detection_lines.lower.far_start.y"
              class="stroke-aruco-edge-failed"
              stroke-width="3"
              stroke-dasharray="8 6"
              opacity="0.7"
            />
            <line
              :x1="e.detection_lines.lower.origin.x"
              :y1="e.detection_lines.lower.origin.y"
              :x2="e.detection_lines.lower.far_end.x"
              :y2="e.detection_lines.lower.far_end.y"
              class="stroke-aruco-edge-failed"
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
