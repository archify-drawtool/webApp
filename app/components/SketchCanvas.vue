<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'
import SketchNode from '~/components/SketchNode.vue'

const { nodeTypes: apiNodeTypes } = useNodeTypes()

const nodeTypes = computed(() =>
  Object.fromEntries(apiNodeTypes.value.map(t => [t.type, SketchNode]))
)
</script>

<template>
  <VueFlow
    :id="SKETCH_CANVAS_ID"
    :node-types="nodeTypes"
    class="w-full h-full"
    :default-edge-options="{ type: 'smoothstep' }"
    :default-viewport="{ zoom: 1 }"
    :min-zoom="0.1"
    :max-zoom="4"
  >
    <Background
      :variant="BackgroundVariant.Dots"
      :gap="20"
      :size="1.5"
      pattern-color="#4b5563"
      bg-color="transparent"
    />
    <Controls :show-interactive="false" />
  </VueFlow>
</template>
