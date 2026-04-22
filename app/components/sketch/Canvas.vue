<script setup lang="ts">

import { VueFlow, useVueFlow, type Connection, type ValidConnectionFunc, Panel, type XYPosition, type GraphEdge } from '@vue-flow/core'
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
const { screenToFlowCoordinate, edges: flowEdges, setEdges } = useVueFlow(SKETCH_CANVAS_ID)
const { saveStatus, saveError, addNodeWithHistory, addEdgeWithHistory, reconnectEdgeWithHistory } = useSketchCanvas()

let lastSelectedEdgeId: string | null = null
watch(
  () => flowEdges.value.map(e => ({ id: e.id, selected: !!e.selected })),
  (next) => {
    for (const { id, selected } of next) {
      const edge = flowEdges.value.find(e => e.id === id)
      if (edge && edge.updatable !== selected) edge.updatable = selected
    }

    const selectedIds = next.filter(e => e.selected).map(e => e.id)
    const newlySelected = selectedIds.find(id => id !== lastSelectedEdgeId)
    if (newlySelected) {
      const current = flowEdges.value
      const target = current.find(e => e.id === newlySelected)
      if (target && current[current.length - 1]?.id !== newlySelected) {
        setEdges([...current.filter(e => e.id !== newlySelected), target])
      }
    }
    lastSelectedEdgeId = selectedIds[selectedIds.length - 1] ?? null
  },
  { deep: true },
)
const { mount: mountDeleteNode, unmount: unmountDeleteNode } = useDeleteNode()
const { mount: mountHistoryWatcher, unmount: unmountHistoryWatcher } = useSketchHistoryWatcher()
onMounted(() => {
  mountDeleteNode()
  mountHistoryWatcher()
})
onUnmounted(() => {
  unmountDeleteNode()
  unmountHistoryWatcher()
})

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
  addEdgeWithHistory([{ ...params, ...defaultEdgeOptions.value }])
}

function onEdgeUpdate({ edge, connection }: { edge: GraphEdge, connection: Connection }) {
  if (connection.source === connection.target) return
  reconnectEdgeWithHistory(edge, connection)
}

function onPaneClick(event: MouseEvent) {
  if (!isPlacingNode.value || !selectedNodeType.value) return

  const nodeType = apiNodeTypes.value.find(nt => nt.type === selectedNodeType.value)
  if (!nodeType) return

  const position: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })

  addNodeWithHistory([{
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
:delete-key-code="null"
:edges-updatable="false"
:is-valid-connection="isValidConnection"
@connect="onConnect"
@edge-update="onEdgeUpdate"
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

.vue-flow__node.selected::after {
  content: '';
  position: absolute;
  inset: 8px;
  background-color: var(--color-primary-500);
  opacity: 0.15;
  border-radius: 4px;
  pointer-events: none;
}
</style>
