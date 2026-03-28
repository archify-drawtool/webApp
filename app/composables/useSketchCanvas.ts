import { useVueFlow } from '@vue-flow/core'

export const SKETCH_CANVAS_ID = 'sketch-canvas'

export function useSketchCanvas() {
  return useVueFlow(SKETCH_CANVAS_ID)
}
