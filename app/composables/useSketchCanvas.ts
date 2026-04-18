import { useVueFlow, type NodeChange, type EdgeChange } from '@vue-flow/core'
import type { Sketch } from '~/types/Sketch'

export const SKETCH_CANVAS_ID = 'sketch-canvas'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const saveStatus = ref<SaveStatus>('idle')
const saveError = ref<string | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingSave = false
let stopWatchers: (() => void) | null = null
export const scheduleSave = { fn: null as (() => void) | null }

export function useSketchCanvas() {
  const vueFlow = useVueFlow(SKETCH_CANVAS_ID)
  const { get, put } = useApi()
  const appConfig = useAppConfig() as { sketch?: { saveDebounceMs?: number } }

  const fetchSketch = async (sketchId: string | number, projectId?: string | number): Promise<Sketch> => {
    const endpoint = projectId
      ? `/api/projects/${projectId}/sketches/${sketchId}`
      : `/api/sketches/${sketchId}`
    const sketch = await get<Sketch>(endpoint)
    if (!sketch) {
      throw createError({ statusCode: 404, statusMessage: 'Schets niet gevonden' })
    }
    vueFlow.setNodes(sketch.canvas_state?.nodes ?? [])
    vueFlow.setEdges((sketch.canvas_state?.edges ?? []).map(edge => ({
      ...edge,
      type: edge.type ?? 'smoothstep',
    })))
    return sketch
  }

  const clearCanvas = () => {
    stopWatchers?.()
    stopWatchers = null
    scheduleSave.fn = null
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = null
    pendingSave = false
    saveStatus.value = 'idle'
    saveError.value = null
    vueFlow.setNodes([])
    vueFlow.setEdges([])
    const { clearHistory } = useSketchHistory()
    clearHistory()
  }

  const watchAndSave = (sketchId: string | number, projectId: string | number) => {
    const endpoint = `/api/projects/${projectId}/sketches/${sketchId}`
    const debounceMs = appConfig.sketch?.saveDebounceMs ?? 2000

    const save = () => {
      pendingSave = true
      saveStatus.value = 'pending'
      if (debounceTimer) clearTimeout(debounceTimer)

      debounceTimer = setTimeout(async () => {
        if (!pendingSave) return
        pendingSave = false

        const { nodes, edges, viewport } = vueFlow.toObject()
        const state = { nodes: nodes ?? [], edges: edges ?? [], viewport }
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

    scheduleSave.fn = save

    const { snapshot } = useSketchHistory()

    const { off: offNodesChange } = vueFlow.onNodesChange((changes: NodeChange[]) => {
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      if (isStructural) save()
    })

    const { off: offEdgesChange } = vueFlow.onEdgesChange((changes: EdgeChange[]) => {
      const isStructural = changes.some(c => c.type === 'add' || c.type === 'remove')
      if (isStructural) save()
    })

    const { off: offDragStart } = vueFlow.onNodeDragStart(() => {
      snapshot()
    })

    const { off: offDragStop } = vueFlow.onNodeDragStop(() => {
      save()
    })

    stopWatchers = () => {
      offNodesChange()
      offEdgesChange()
      offDragStart()
      offDragStop()
    }
  }

  function addNodeWithHistory(...args: Parameters<typeof vueFlow.addNodes>) {
    const { snapshot } = useSketchHistory()
    snapshot()
    vueFlow.addNodes(...args)
  }

  function addEdgeWithHistory(...args: Parameters<typeof vueFlow.addEdges>) {
    const { snapshot } = useSketchHistory()
    snapshot()
    vueFlow.addEdges(...args)
  }

  function updateEdgeLabelWithHistory(id: string, label: string) {
    const { snapshot } = useSketchHistory()
    snapshot()
    const edge = vueFlow.findEdge(id)
    if (edge) edge.label = label
    scheduleSave.fn?.()
  }

  return {
    ...vueFlow,
    fetchSketch,
    clearCanvas,
    watchAndSave,
    saveStatus,
    saveError,
    addNodeWithHistory,
    addEdgeWithHistory,
    updateEdgeLabelWithHistory,
  }
}
