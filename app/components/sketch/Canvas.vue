<script setup lang="ts">

import { VueFlow, useVueFlow, type Connection, type ValidConnectionFunc, Panel, type XYPosition } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'
import SketchNode from '~/components/sketch/Node.vue'
import SketchEdge from '~/components/sketch/Edge.vue'
import SketchToolbar from '~/components/sketch/Toolbar.vue'
import { markRaw } from 'vue'

const { nodeTypes: apiNodeTypes, fetchNodeTypes } = useNodeTypes()
await fetchNodeTypes()
const { defaultEdgeOptions } = useEdgeTool()
const { selectedNodeType, isPlacingNode, stopPlacing } = useNodeTool()
const { addEdges, addNodes, screenToFlowCoordinate } = useVueFlow(SKETCH_CANVAS_ID)
const { saveStatus, saveError } = useSketchCanvas()

const saveLabel = computed(() => {
  switch (saveStatus.value) {
    case 'pending': return { text: 'Onopgeslagen wijzigingen', error: false }
    case 'saving':  return { text: 'Opslaan...', error: false }
    case 'saved':   return { text: 'Opgeslagen', error: false }
    case 'error':   return { text: saveError.value ?? 'Opslaan mislukt', error: true }
    default:        return null
  }
})

const rawSketchNode = markRaw(SketchNode)
const rawSketchEdge = markRaw(SketchEdge)

const nodeTypes = computed(() =>
  Object.fromEntries(apiNodeTypes.value.map(t => [t.type, rawSketchNode]))
)
const edgeTypes = { smoothstep: rawSketchEdge }

const isValidConnection: ValidConnectionFunc = (connection) =>
  connection.source !== connection.target

function onConnect(params: Connection) {
  addEdges([{ ...params, ...defaultEdgeOptions.value }])
}

function onPaneClick(event: MouseEvent) {
  if (!isPlacingNode.value || !selectedNodeType.value) return

  const nodeType = apiNodeTypes.value.find(nt => nt.type === selectedNodeType.value)
  if (!nodeType) return

  const position: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })

  addNodes([{
    id: crypto.randomUUID(),
    type: nodeType.type,
    position,
    data: { label: nodeType.name },
  }])

  stopPlacing()
}
</script>

<template>
  <VueFlow
:id="SKETCH_CANVAS_ID"
:node-types="nodeTypes"
:class="['w-full h-full', isPlacingNode ? 'placing-node' : '']"
:edge-types="edgeTypes"
:default-edge-options="defaultEdgeOptions"
:default-viewport="{ zoom: 1 }"
:min-zoom="0.1"
:max-zoom="4"
:is-valid-connection="isValidConnection"
@connect="onConnect"
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
  <Panel v-if="saveLabel" position="bottom-right" class="pointer-events-none text-xs mb-1 mr-1">
    <span :class="saveLabel.error ? 'text-red-400' : 'text-gray-500'">{{ saveLabel.text }}</span>
  </Panel>
  </VueFlow>
</template>

<style>
.placing-node .vue-flow__pane {
  cursor: crosshair;
}
</style>
