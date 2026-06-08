<script setup lang="ts">
  
import { VueFlow, useVueFlow, useKeyPress, type Connection, type ValidConnectionFunc, Panel, type XYPosition, type GraphEdge, type NodeDragEvent, type NodeMouseEvent } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'
import SketchNode from '~/components/sketch/Node.vue'
import SketchNoteNode from '~/components/sketch/NoteNode.vue'
import SketchEdge from '~/components/sketch/Edge.vue'
import SketchToolbar from '~/components/sketch/Toolbar.vue'
import { markRaw } from 'vue'

const { nodeTypes: apiNodeTypes, fetchNodeTypes } = useNodeTypes()
await fetchNodeTypes()
const { defaultEdgeOptions } = useEdgeTool()
const { selectedNodeType, isPlacingNode, stopPlacing, pendingFocusNodeId } = useNodeTool()
const { isDragToolActive } = useDragTool()
const { isCommentToolActive } = useCommentTool()
const { addComment } = useComments()
const { activatePointerTool } = usePointerTool()
const commentAutoOpenId = useState<number | null>('comment-auto-open-id', () => null)
const { screenToFlowCoordinate, edges: flowEdges, setEdges, nodesSelectionActive, addSelectedNodes, getSelectedNodes, onSelectionEnd, onPaneClick: onPaneClickHook, onConnect: onConnectHook, onNodeDragStart: onNodeDragStartHook, onEdgeUpdate: onEdgeUpdateHook, onNodeClick: onNodeClickHook, onNodesInitialized, fitView } = useVueFlow(SKETCH_CANVAS_ID)

const hasSelectedEdge = computed(() => flowEdges.value.some(e => e.selected))

onNodesInitialized(() => {
  if (fitViewPending.value) {
    fitViewPending.value = false
    fitView({ padding: 0.35, duration: 0 })
  }
})

onSelectionEnd(() => {
  const selected = getSelectedNodes.value
  nodesSelectionActive.value = false
  if (selected.length > 0) addSelectedNodes(selected)
})
  
const { saveStatus, saveError, fitViewPending, addNodeWithHistory, addEdgeWithHistory, reconnectEdgeWithHistory } = useSketchCanvas()
const { showDots } = useDotsToggle()

watch(
  () => flowEdges.value.map(e => ({ id: e.id, selected: !!e.selected })),
  (next, prev) => {
    for (const { id, selected } of next) {
      const edge = flowEdges.value.find(e => e.id === id)
      if (edge && edge.updatable !== selected) edge.updatable = selected
    }

    const prevSelectedIds = new Set((prev ?? []).filter(e => e.selected).map(e => e.id))
    const newlySelected = next.find(e => e.selected && !prevSelectedIds.has(e.id))
    if (newlySelected) {
      const current = flowEdges.value
      const target = current.find(e => e.id === newlySelected.id)
      if (target && current[current.length - 1]?.id !== newlySelected.id) {
        setEdges([...current.filter(e => e.id !== newlySelected.id), target])
      }
    }
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
const rawSketchNoteNode = markRaw(SketchNoteNode)
const rawSketchEdge = markRaw(SketchEdge)

const nodeTypes = computed(() =>
  Object.fromEntries(
    apiNodeTypes.value.map(t => [
      t.type,
      t.type === 'note' ? rawSketchNoteNode : rawSketchNode,
    ])
  )
)
const edgeTypes = { straight: rawSketchEdge }

const isValidConnection: ValidConnectionFunc = (connection) =>
  connection.source !== connection.target

function onConnect(params: Connection) {
  if (isDragToolActive.value) return
  addEdgeWithHistory([{ ...params, ...defaultEdgeOptions.value }])
  stopPlacing()
}

function onEdgeUpdate({ edge, connection }: { edge: GraphEdge, connection: Connection }) {
  if (connection.source === connection.target) return
  reconnectEdgeWithHistory(edge, connection)
}

const { state: edgeContextMenu, close: closeEdgeContextMenu } = useEdgeContextMenu()

const isSpacePressed = useKeyPress('Space')

const panOnDrag = computed(() => {
  if (isDragToolActive.value) return true
  return isSpacePressed.value ? [0, 1] as number[] : [1] as number[]
})

function onNodeDragStart({ event, node }: NodeDragEvent) {
  if (!event.ctrlKey || node.selected || getSelectedNodes.value.length === 0) return
  addSelectedNodes([node])
}


let suppressNextPaneClick = false

function onWrapperMouseDown() {
  const active = document.activeElement
  if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) {
    suppressNextPaneClick = true
  }
}

const route = useRoute()

function onPaneClick(event: MouseEvent) {
  if (isSpacePressed.value) return

  if (suppressNextPaneClick) {
    suppressNextPaneClick = false
    return
  }

  if (isCommentToolActive.value) {
    const sketchId = Number(route.params.id)
    if (!Number.isFinite(sketchId)) return
    const position: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
    void addComment(sketchId, position.x, position.y, '').then(created => {
      if (created) commentAutoOpenId.value = created.id
    })
    activatePointerTool()
    return
  }

  if (!isPlacingNode.value || !selectedNodeType.value) return

  const nodeType = apiNodeTypes.value.find(nt => nt.type === selectedNodeType.value)
  if (!nodeType) return

  const position: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })

  const nodeId = crypto.randomUUID()
  addNodeWithHistory([{
    id: nodeId,
    type: nodeType.type,
    position,
    data: { label: nodeType.name },
  }])
  pendingFocusNodeId.value = nodeId
}

function onNodeClick({ event }: NodeMouseEvent) {
  if (!isCommentToolActive.value || isSpacePressed.value) return
  if (!(event instanceof MouseEvent)) return
  const sketchId = Number(route.params.id)
  if (!Number.isFinite(sketchId)) return
  const position: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  void addComment(sketchId, position.x, position.y, '').then(created => {
    if (created) commentAutoOpenId.value = created.id
  })
  activatePointerTool()
}

onPaneClickHook(onPaneClick)
onConnectHook(onConnect)
onNodeDragStartHook(onNodeDragStart)
onEdgeUpdateHook(onEdgeUpdate)
onNodeClickHook(onNodeClick)
</script>

<template>
  <div
    class="w-full h-full"
    :class="{ 'drag-tool-active': isDragToolActive, 'edge-selected': hasSelectedEdge }"
    @mousedown="onWrapperMouseDown"
    @contextmenu="(e: MouseEvent) => { if (e.ctrlKey) { e.preventDefault(); e.stopPropagation() } }"
  >
  <VueFlow
:id="SKETCH_CANVAS_ID"
:node-types="nodeTypes"
:class="['w-full h-full', isPlacingNode || isCommentToolActive ? (isSpacePressed ? 'placing-node space-pan' : 'placing-node') : isDragToolActive ? 'drag-tool-active' : '']"
:edge-types="edgeTypes"
:default-edge-options="defaultEdgeOptions"
:default-viewport="{ zoom: 1 }"
:min-zoom="0.1"
:max-zoom="4"
:delete-key-code="null"
:edges-updatable="!isDragToolActive"
:edge-updater-radius="20"
:pan-on-drag="panOnDrag"
:selection-key-code="isDragToolActive || isPlacingNode || isCommentToolActive ? null : true"
:multi-selection-key-code="'Control'"
:nodes-draggable="!isDragToolActive && !isCommentToolActive"
:elements-selectable="!isDragToolActive && !isCommentToolActive"
:is-valid-connection="isValidConnection"
>
  <Background
    v-if="showDots"
    :variant="BackgroundVariant.Dots"
    :gap="20"
    :size="1.5"
    pattern-color="#4b5563"
    bg-color="transparent"
  />
  <Controls :show-interactive="false" />
  <SketchToolbar />
  <SketchEdgeContextMenu
    v-if="edgeContextMenu"
    v-bind="edgeContextMenu"
    @close="closeEdgeContextMenu"
  />
  <Panel v-if="saveLabel" position="bottom-right" class="pointer-events-none text-xs mb-1 mr-1">
    <span :class="saveLabel.error ? 'text-red-400' : 'text-gray-500'">{{ saveLabel.text }}</span>
  </Panel>
  </VueFlow>
  <SketchCommentLayer />
  <SketchNodeContextMenu />
  </div>
</template>

<style>
.placing-node .vue-flow__pane,
.placing-node .vue-flow__node {
  cursor: crosshair !important;
}

.placing-node.space-pan .vue-flow__pane {
  cursor: grab;
}

.placing-node.space-pan .vue-flow__pane:active {
  cursor: grabbing;
}

.drag-tool-active .vue-flow__pane {
  cursor: grab;
}

.drag-tool-active .vue-flow__pane:active {
  cursor: grabbing;
}

.drag-tool-active .vue-flow__edge,
.drag-tool-active .archify-edge-hit {
  pointer-events: none;
}

.drag-tool-active .vue-flow__node {
  pointer-events: none !important;
}

.drag-tool-active .pin-button {
  pointer-events: none !important;
}

.drag-tool-active .comment-pin {
  cursor: grab;
}

.archify-edge-hit {
  pointer-events: stroke;
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

.vue-flow__selection {
  border: 2px dashed var(--color-primary-500);
  background-color: color-mix(in srgb, var(--color-primary-500) 8%, transparent);
}

.vue-flow__nodesselection-rect {
  border: none;
  background: transparent;
}

.vue-flow__handle {
  width: 6px !important;
  height: 6px !important;
  background-color: #555 !important;
  border: 1px solid #fff !important;
  border-radius: 50% !important;
}

/* Vergroot het klikgebied zonder de lijn-eindpunten te beïnvloeden */
.vue-flow__handle::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  background: transparent;
}

/* Geselecteerde edge bovenop nodes zodat edgeupdater klikbaar is */
.vue-flow__edge.selected {
  z-index: 1001 !important;
}

.vue-flow__edgeupdater {
  cursor: move;
  pointer-events: all;
}

/* Als een edge geselecteerd is: handles en nodes niet meer klikbaar zodat edgeupdater erdoorheen komt */
.edge-selected .vue-flow__handle {
  pointer-events: none !important;
}

.edge-selected .vue-flow__node {
  pointer-events: none !important;
}
</style>
