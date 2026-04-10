<script setup lang="ts">

import { VueFlow, useVueFlow, type Connection, type ValidConnectionFunc, Panel } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'
import SketchNode from '~/components/sketch/Node.vue'
import SketchToolbar from '~/components/sketch/Toolbar.vue'
import { markRaw } from 'vue'

const { nodeTypes: apiNodeTypes, fetchNodeTypes } = useNodeTypes()
await fetchNodeTypes()
const { defaultEdgeOptions } = useEdgeTool()
const { addEdges } = useVueFlow(SKETCH_CANVAS_ID)
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
const nodeTypes = computed(() =>
  Object.fromEntries(apiNodeTypes.value.map(t => [t.type, rawSketchNode]))
)

const isValidConnection: ValidConnectionFunc = (connection) =>
  connection.source !== connection.target

function onConnect(params: Connection) {
  addEdges([{ ...params, ...defaultEdgeOptions.value }])
}
</script>

<template>
  <VueFlow
:id="SKETCH_CANVAS_ID"
:node-types="nodeTypes"
class="w-full h-full"
:default-edge-options="defaultEdgeOptions"
:default-viewport="{ zoom: 1 }"
:min-zoom="0.1"
:max-zoom="4"
:is-valid-connection="isValidConnection"
@connect="onConnect"
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
