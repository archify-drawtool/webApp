import { useVueFlow } from '@vue-flow/core'
import { effectScope } from 'vue'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

export default defineNuxtPlugin(() => {
  const scope = effectScope(true)
  scope.run(() => {
    useVueFlow(SKETCH_CANVAS_ID)
  })
})
