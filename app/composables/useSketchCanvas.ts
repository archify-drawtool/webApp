import { useVueFlow } from '@vue-flow/core'
import type { Sketch } from '~/types/Sketch'

export const SKETCH_CANVAS_ID = 'sketch-canvas'

export function useSketchCanvas() {
  const vueFlow = useVueFlow(SKETCH_CANVAS_ID)
  const { get } = useApi()

  const fetchSketch = async (sketchId: string | number, projectId?: string | number): Promise<Sketch | undefined> => {
    const endpoint = projectId
      ? `/api/projects/${projectId}/sketches/${sketchId}`
      : `/api/sketches/${sketchId}`
    const sketch = await get<Sketch>(endpoint)
    if (sketch) {
      vueFlow.setNodes(sketch.canvas_state?.nodes ?? [])
      vueFlow.setEdges((sketch.canvas_state?.edges ?? []).map(({ type: _, ...edge }) => edge))
    }
    return sketch
  }

  const clearCanvas = () => {
    vueFlow.setNodes([])
    vueFlow.setEdges([])
  }

  return { ...vueFlow, fetchSketch, clearCanvas }
}
