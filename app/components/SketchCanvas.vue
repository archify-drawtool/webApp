<script setup lang="ts">
import { VueFlow, useVueFlow } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'
import SketchNode from '~/components/SketchNode.vue'
import SketchToolbar from '~/components/SketchToolbar.vue'
import { markRaw } from 'vue'

const { nodeTypes: apiNodeTypes, fetchNodeTypes } = useNodeTypes()
await fetchNodeTypes()
const { defaultEdgeOptions } = useEdgeTool()
const { pendingNodeType, clearNodeType } = useNodeTool()
const { screenToFlowCoordinate, addNodes } = useVueFlow(SKETCH_CANVAS_ID)

const rawSketchNode = markRaw(SketchNode)
const nodeTypes = computed(() =>
  Object.fromEntries(apiNodeTypes.value.map(t => [t.type, rawSketchNode]))
)

const canvasClass = computed(() =>
  pendingNodeType.value ? 'w-full h-full cursor-crosshair' : 'w-full h-full'
)

function onPaneClick(event: MouseEvent) {
  if (!pendingNodeType.value) return
  const position = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  addNodes([{ id: crypto.randomUUID(), type: pendingNodeType.value, position, data: {} }])
  clearNodeType()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape') clearNodeType()
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <VueFlow
    :id="SKETCH_CANVAS_ID"
    :node-types="nodeTypes"
    :class="canvasClass"
    :default-edge-options="defaultEdgeOptions"
    :default-viewport="{ zoom: 1 }"
    :min-zoom="0.1"
    :max-zoom="4"
    @pane-click="onPaneClick"
  >
    <Background
      :variant="BackgroundVariant.Dots"
      :gap="20"
      :size="1.5"
      pattern-color="#4b5563"
      bg-color="transparent"
    />
    <Controls :show-interactive="false" />
    <SketchToolbar />
  </VueFlow>
</template>
