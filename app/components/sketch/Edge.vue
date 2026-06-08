<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getStraightPath, type EdgeProps } from '@vue-flow/core'

const props = defineProps<EdgeProps>()

const { updateEdgeLabelWithHistory } = useSketchCanvas()
const { isDragToolActive } = useDragTool()
const { open: openEdgeContextMenu } = useEdgeContextMenu()

const pathData = computed(() =>
  getStraightPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    targetX: props.targetX,
    targetY: props.targetY,
  })
)

const editing = ref(false)
const editValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  if (isDragToolActive.value) return
  editValue.value = typeof props.label === 'string' ? props.label : ''
  editing.value = true
  nextTick(() => inputRef.value?.focus())
}

function confirmEdit() {
  if (!editing.value) return
  editing.value = false
  updateEdgeLabelWithHistory(props.id, editValue.value)
}

function cancelEdit() {
  editing.value = false
}

const emptyMarkerPattern = /url\(['"]?#['"]?\)/

const hasMarkerEnd = computed(() => {
  const url = props.markerEnd
  return !!url && !emptyMarkerPattern.test(url)
})

const hasMarkerStart = computed(() => {
  const url = props.markerStart
  return !!url && !emptyMarkerPattern.test(url)
})

const markerEndId = computed(() => `archify-marker-end-${props.id}`)
const markerStartId = computed(() => `archify-marker-start-${props.id}`)

function onContextMenu(event: MouseEvent) {
  event.preventDefault()
  openEdgeContextMenu({
    edgeId: props.id,
    x: event.clientX,
    y: event.clientY,
    hasMarkerEnd: hasMarkerEnd.value,
    hasMarkerStart: hasMarkerStart.value,
    isDashed: !!((props.style as Record<string, unknown> | undefined)?.strokeDasharray),
  })
}
</script>

<template>
  <defs>
    <marker
      v-if="hasMarkerEnd"
      :id="markerEndId"
      class="vue-flow__arrowhead"
      viewBox="-10 -10 20 20"
      refX="0"
      refY="0"
      markerWidth="12.5"
      markerHeight="12.5"
      markerUnits="strokeWidth"
      orient="auto-start-reverse"
    >
      <polyline
        stroke="#b1b1b7"
        fill="#b1b1b7"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        points="-5,-4 0,0 -5,4 -5,-4"
      />
    </marker>
    <marker
      v-if="hasMarkerStart"
      :id="markerStartId"
      class="vue-flow__arrowhead"
      viewBox="-10 -10 20 20"
      refX="0"
      refY="0"
      markerWidth="12.5"
      markerHeight="12.5"
      markerUnits="strokeWidth"
      orient="auto-start-reverse"
    >
      <polyline
        stroke="#b1b1b7"
        fill="#b1b1b7"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        points="-5,-4 0,0 -5,4 -5,-4"
      />
    </marker>
  </defs>
  <!-- :style="style" is intentional: VueFlow EdgeProps passes SVG presentation
       attributes (stroke, strokeDasharray, …) that have no Tailwind equivalent.
       Removing it would break dashed / coloured edges. -->
  <BaseEdge
    :id="id"
    :key="`${id}:${hasMarkerStart ? 's' : ''}${hasMarkerEnd ? 'e' : ''}`"
    :path="pathData[0]"
    :marker-end="hasMarkerEnd ? `url(#${markerEndId})` : undefined"
    :marker-start="hasMarkerStart ? `url(#${markerStartId})` : undefined"
    :style="style"
  />
  <path
    :d="pathData[0]"
    fill="none"
    stroke="transparent"
    stroke-width="30"
    class="archify-edge-hit cursor-pointer"
    @dblclick.stop="startEdit"
    @contextmenu.stop.prevent="onContextMenu"
  />
  <EdgeLabelRenderer>
    <div
      :style="{ '--label-x': `${pathData[1]}px`, '--label-y': `${pathData[2]}px` }"
      :class="['absolute nodrag nopan [transform:translate(-50%,-50%)_translate(var(--label-x),var(--label-y))]', isDragToolActive ? 'pointer-events-none' : 'pointer-events-auto']"
    >
      <input
        v-if="editing"
        ref="inputRef"
        v-model="editValue"
class="text-xs text-center rounded px-1 outline-none min-w-16 border bg-white text-gray-800 border-gray-300"
        @keydown.enter="confirmEdit"
        @keydown.escape="cancelEdit"
        @blur="confirmEdit"
        @click.stop
        @mousedown.stop
      >
      <span
        v-else-if="label"
        class="text-xs px-1 py-0.5 rounded cursor-pointer bg-white text-gray-800 max-w-32 break-words text-center block"
        @dblclick.stop="startEdit"
      >{{ label }}</span>
      <span
        v-else
        class="block w-5 h-5 cursor-pointer"
      />
    </div>
  </EdgeLabelRenderer>
</template>

