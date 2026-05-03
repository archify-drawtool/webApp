<script setup lang="ts">
import { VueFlow, useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import PublicNode from '~/components/sketch/PublicNode.vue'
import PublicNoteNode from '~/components/sketch/PublicNoteNode.vue'
import SketchEdge from '~/components/sketch/Edge.vue'
import { markRaw } from 'vue'

const PUBLIC_CANVAS_ID = 'public-sketch-canvas'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
}>()

const { setNodes, setEdges } = useVueFlow(PUBLIC_CANVAS_ID)
const { fetchNodeTypes } = usePublicNodeTypes()

onMounted(fetchNodeTypes)

const rawPublicNode = markRaw(PublicNode)
const rawPublicNoteNode = markRaw(PublicNoteNode)
const rawSketchEdge = markRaw(SketchEdge)

const nodeTypes = computed(() => ({
  note: rawPublicNoteNode,
  ...Object.fromEntries(
    props.nodes
      .map(n => n.type)
      .filter((t): t is string => !!t && t !== 'note')
      .map(t => [t, rawPublicNode]),
  ),
}))

const edgeTypes = { smoothstep: rawSketchEdge }

watch(
  () => [props.nodes, props.edges] as [Node[], Edge[]],
  ([nodes, edges]) => {
    setNodes(nodes ?? [])
    setEdges((edges ?? []).map((edge) => {
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
  },
  { immediate: true },
)
</script>

<template>
  <div class="w-full h-full bg-white" @dblclick.capture.stop>
    <VueFlow
      :id="PUBLIC_CANVAS_ID"
      :node-types="nodeTypes"
      :edge-types="edgeTypes"
      :nodes-draggable="false"
      :nodes-connectable="false"
      :elements-selectable="false"
      :delete-key-code="null"
      :default-viewport="{ zoom: 1 }"
      :min-zoom="0.1"
      :max-zoom="4"
      class="w-full h-full"
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
  </div>
</template>
