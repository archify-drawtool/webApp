import { useVueFlow, MarkerType, type NodeChange, type EdgeChange, type Connection, type GraphEdge } from '@vue-flow/core'
import type { Sketch } from '~/types/Sketch'

export const SKETCH_CANVAS_ID = 'sketch-canvas'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const saveStatus = ref<SaveStatus>('idle')
const saveError = ref<string | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingSave = false
let stopWatchers: (() => void) | null = null
let currentSave: (() => void) | null = null

export function useSketchCanvas() {
  const vueFlow = useVueFlow(SKETCH_CANVAS_ID)
  const { get, put } = useApi()
  const appConfig = useAppConfig() as { sketch?: { saveDebounceMs?: number } }
  const { snapshot, undo: historyUndo, redo: historyRedo} = useSketchHistory()

  const fetchSketch = async (sketchId: string | number): Promise<Sketch> => {
    const endpoint = `/api/sketches/${sketchId}`;
    const sketch = await get<Sketch>(endpoint)
    if (!sketch) {
        throw createError({ statusCode: 404, statusMessage: 'Schets niet gevonden' })
    }
    if (sketch) {
      const { setDotsVisible } = useDotsToggle()
      setDotsVisible(sketch.canvas_state?.show_dots ?? true)
      const { loadComments } = useComments()
      void loadComments(sketch.id)
      vueFlow.setNodes(sketch.canvas_state?.nodes ?? [])
      vueFlow.setEdges((sketch.canvas_state?.edges ?? []).map((edge) => {
        // Bouw het edge object opnieuw op zonder ongeldige markers.
        // VueFlow genereert url('#') als markerEnd/markerStart aanwezig is maar geen geldig type heeft.
        const { markerEnd, markerStart, ...rest } = edge
        const normalized: typeof edge = {
          ...rest,
          type: edge.type ?? 'smoothstep',
        }
        const validMarkerEnd = markerEnd && (markerEnd as { type?: string }).type
        const validMarkerStart = markerStart && (markerStart as { type?: string }).type
        if (validMarkerEnd) normalized.markerEnd = markerEnd
        if (validMarkerStart) normalized.markerStart = markerStart
        return normalized
      }))
    }
    return sketch
  }

  const clearCanvas = () => {
    stopWatchers?.()
    stopWatchers = null
    currentSave = null
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
    pendingSave = false
    saveStatus.value = 'idle'
    saveError.value = null
    vueFlow.setNodes([])
    vueFlow.setEdges([])
    const { setDotsVisible } = useDotsToggle()
    setDotsVisible(true)
    const { clearHistory } = useSketchHistory()
    clearHistory()

    const { activeTool } = useActiveTool()
    activeTool.value = 'drag'

    const { selectedNodeType, isPlacingNode } = useNodeTool()
    selectedNodeType.value = null
    isPlacingNode.value = false

    const { activeEdgeTool } = useEdgeTool()
    activeEdgeTool.value = 'none'

    const { clearComments } = useComments()
    clearComments()
  }

  const watchAndSave = (sketchId: string | number) => {
    stopWatchers?.()

    const endpoint = `/api/sketches/${sketchId}`
    const debounceMs = appConfig.sketch?.saveDebounceMs ?? 2000

    const save = () => {
      pendingSave = true
      saveStatus.value = 'pending'
      if (debounceTimer) clearTimeout(debounceTimer)

      debounceTimer = setTimeout(async () => {
        if (!pendingSave) return
        pendingSave = false

        const { nodes, edges, viewport } = vueFlow.toObject()
        const { showDots } = useDotsToggle()
        const state = { nodes: nodes ?? [], edges: edges ?? [], viewport, show_dots: showDots.value }
        saveStatus.value = 'saving'
        saveError.value = null

        try {
          await put(endpoint, { canvas_state: state })
          saveStatus.value = 'saved'
        } catch (e) {
          const err = e as { statusMessage?: string; message?: string }
          saveError.value = err?.statusMessage ?? err?.message ?? 'Opslaan mislukt'
          saveStatus.value = 'error'
          pendingSave = true
        }
      }, debounceMs)
    }

    currentSave = save

    const { off: offNodesChange } = vueFlow.onNodesChange((changes: NodeChange[]) => {
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      if (isStructural) save()
    })

    const { off: offEdgesChange } = vueFlow.onEdgesChange((changes: EdgeChange[]) => {
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      if (isStructural) save()
    })

    const { off: offDragStop } = vueFlow.onNodeDragStop(() => {
      save()
    })

    stopWatchers = () => {
      offNodesChange()
      offEdgesChange()
      offDragStop()
    }
  }

  function addNodeWithHistory(...args: Parameters<typeof vueFlow.addNodes>) {
    snapshot()
    vueFlow.addNodes(...args)
  }

  function addEdgeWithHistory(...args: Parameters<typeof vueFlow.addEdges>) {
    snapshot()
    vueFlow.addEdges(...args)
  }

  function updateEdgeLabelWithHistory(id: string, label: string) {
    snapshot()
    const edge = vueFlow.findEdge(id)
    if (edge) edge.label = label
    currentSave?.()
  }

  function updateEdgePropertiesWithHistory(
    id: string,
    updates: { markerEnd?: boolean; markerStart?: boolean; dashed?: boolean },
  ) {
    const edge = vueFlow.findEdge(id)
    if (!edge) return

    const { snapshot } = useSketchHistory()
    snapshot()

    const markerEnd = 'markerEnd' in updates
      ? (updates.markerEnd ? { type: MarkerType.ArrowClosed } : '')
      : (edge.markerEnd ?? '')

    const markerStart = 'markerStart' in updates
      ? (updates.markerStart ? { type: MarkerType.ArrowClosed } : '')
      : (edge.markerStart ?? '')

    const currentStyle = typeof edge.style === 'object' && edge.style ? edge.style : {}
    let style: Record<string, unknown> | undefined = edge.style
    if ('dashed' in updates) {
      const { strokeDasharray: _omit, ...rest } = currentStyle as Record<string, unknown>
      style = updates.dashed ? { ...rest, strokeDasharray: '6 4' } : rest
    }

    vueFlow.setEdges(
      vueFlow.getEdges.value.map(e =>
        e.id === id ? { ...e, markerEnd, markerStart, style } : e,
      ),
    )

    currentSave?.()
  }

  function updateNodeLabelWithHistory(id: string, label: string) {
    snapshot()
    vueFlow.updateNodeData(id, { label })
    currentSave?.()
  }

  function reconnectEdgeWithHistory(oldEdge: GraphEdge, newConnection: Connection) {
    const { snapshot } = useSketchHistory()
    snapshot()
    const updated = vueFlow.updateEdge(oldEdge, newConnection)
    if (updated) {
      updated.type = oldEdge.type
      updated.markerStart = oldEdge.markerStart
      updated.markerEnd = oldEdge.markerEnd
      currentSave?.()
    }
    return updated
  }

  function changeNodeTypeWithHistory(id: string, newType: string) {
    const { snapshot } = useSketchHistory()
    snapshot()
    vueFlow.updateNode(id, { type: newType })
    currentSave?.()
  }

  function undo() {
    if (historyUndo()) currentSave?.()
  }

  function redo() {
    if (historyRedo()) currentSave?.()
  }

  function triggerSave() {
    currentSave?.()
  }

  function stopSaving() {
    stopWatchers?.()
    stopWatchers = null
    currentSave = null
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
    pendingSave = false
    saveStatus.value = 'idle'
    saveError.value = null
  }

  return {
    ...vueFlow,
    fetchSketch,
    clearCanvas,
    stopSaving,
    watchAndSave,
    triggerSave,
    saveStatus,
    saveError,
    addNodeWithHistory,
    addEdgeWithHistory,
    updateEdgeLabelWithHistory,
    updateEdgePropertiesWithHistory,
    updateNodeLabelWithHistory,
    reconnectEdgeWithHistory,
    changeNodeTypeWithHistory,
    undo,
    redo,
  }
}
