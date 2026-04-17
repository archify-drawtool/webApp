import { useVueFlow } from '@vue-flow/core'
import type { Sketch } from '~/types/Sketch'

export const SKETCH_CANVAS_ID = 'sketch-canvas'

export type SaveStatus = 'idle' | 'pending' | 'saving' | 'saved' | 'error'

const saveStatus = ref<SaveStatus>('idle')
const saveError = ref<string | null>(null)
let debounceTimer: ReturnType<typeof setTimeout> | null = null
let pendingSave = false

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
    if (sketch) {
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
    saveStatus.value = 'idle'
    saveError.value = null
    vueFlow.setNodes([])
    vueFlow.setEdges([])
  }

  const watchAndSave = (sketchId: string | number, projectId: string | number) => {
    const endpoint = `/api/projects/${projectId}/sketches/${sketchId}`
    const debounceMs = appConfig.sketch?.saveDebounceMs ?? 2000

    const scheduleSave = () => {
      pendingSave = true
      saveStatus.value = 'pending'
      if (debounceTimer) clearTimeout(debounceTimer)

      debounceTimer = setTimeout(async () => {
        if (!pendingSave) return
        pendingSave = false

        const state = vueFlow.toObject()
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

    vueFlow.onNodesChange(scheduleSave)
    vueFlow.onEdgesChange(scheduleSave)
    vueFlow.onNodeDragStop(scheduleSave)
  }

  return { ...vueFlow, fetchSketch, clearCanvas, watchAndSave, saveStatus, saveError }
}
