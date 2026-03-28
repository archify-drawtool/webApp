import { useVueFlow } from '@vue-flow/core'

const CANVAS_ID = 'sketch-canvas'

export function useSketchCanvas() {
  return useVueFlow(CANVAS_ID)
}
