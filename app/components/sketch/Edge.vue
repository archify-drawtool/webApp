<script setup lang="ts">
import { BaseEdge, EdgeLabelRenderer, getSmoothStepPath, useVueFlow, type EdgeProps } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const props = defineProps<EdgeProps>()

const { findEdge } = useVueFlow(SKETCH_CANVAS_ID)

const pathData = computed(() =>
  getSmoothStepPath({
    sourceX: props.sourceX,
    sourceY: props.sourceY,
    sourcePosition: props.sourcePosition,
    targetX: props.targetX,
    targetY: props.targetY,
    targetPosition: props.targetPosition,
  })
)

const editing = ref(false)
const editValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  editValue.value = typeof props.label === 'string' ? props.label : ''
  editing.value = true
  nextTick(() => inputRef.value?.focus())
}

function confirmEdit() {
  if (!editing.value) return
  editing.value = false
  const edge = findEdge(props.id)
  if (edge) edge.label = editValue.value
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <BaseEdge
    :id="id"
    :path="pathData[0]"
    :marker-end="markerEnd"
    :marker-start="markerStart"
    :style="style"
  />
  <path
    :d="pathData[0]"
    fill="none"
    stroke="transparent"
    stroke-width="20"
    class="cursor-pointer"
    @dblclick.stop="startEdit"
  />
  <EdgeLabelRenderer>
    <div
      :style="{ transform: `translate(-50%, -50%) translate(${pathData[1]}px,${pathData[2]}px)` }"
      class="absolute pointer-events-auto nodrag nopan"
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
        class="text-xs px-1 py-0.5 rounded cursor-pointer bg-white text-gray-800"
      >{{ label }}</span>
      <span
        v-else
        class="block w-5 h-5 cursor-pointer"
      />
    </div>
  </EdgeLabelRenderer>
</template>
