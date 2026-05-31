<script setup lang="ts">
import { VueFlow, useVueFlow, type Node, type Edge, type XYPosition } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
import { MessageSquare, MousePointer2 } from 'lucide-vue-next'
import PublicNode from '~/components/sketch/PublicNode.vue'
import PublicNoteNode from '~/components/sketch/PublicNoteNode.vue'
import SketchEdge from '~/components/sketch/Edge.vue'
import { markRaw } from 'vue'

const PUBLIC_CANVAS_ID = 'public-sketch-canvas'
const GUEST_NAME_KEY = 'archify:guest-name'

const props = defineProps<{
  nodes: Node[]
  edges: Edge[]
  token: string
}>()

const { setNodes, setEdges, screenToFlowCoordinate } = useVueFlow(PUBLIC_CANVAS_ID)
const { fetchNodeTypes } = usePublicNodeTypes()
const { loadPublicComments, addPublicComment, clearComments } = useComments()

const storedName = ref('')
const showPlacementModal = ref(false)
const nameInput = ref('')
const bodyInput = ref('')
const pendingPlacement = ref<{ x: number; y: number } | null>(null)
const isCommentMode = ref(false)

const needsName = computed(() => storedName.value.trim().length === 0)
const canSubmit = computed(() => nameInput.value.trim().length > 0 && bodyInput.value.trim().length > 0)

onMounted(async () => {
  fetchNodeTypes()
  if (typeof window !== 'undefined') {
    storedName.value = window.localStorage.getItem(GUEST_NAME_KEY) ?? ''
  }
  await loadPublicComments(props.token)
})

onUnmounted(() => {
  clearComments()
})

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

function onPaneClick(event: MouseEvent) {
  if (!isCommentMode.value) return
  const pos: XYPosition = screenToFlowCoordinate({ x: event.clientX, y: event.clientY })
  pendingPlacement.value = { x: pos.x, y: pos.y }
  nameInput.value = storedName.value
  bodyInput.value = ''
  showPlacementModal.value = true
}

async function submitPlacement() {
  if (!canSubmit.value || !pendingPlacement.value) return
  const name = nameInput.value.trim()
  const body = bodyInput.value.trim()
  const { x, y } = pendingPlacement.value
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(GUEST_NAME_KEY, name)
  }
  storedName.value = name
  pendingPlacement.value = null
  showPlacementModal.value = false
  isCommentMode.value = false
  await addPublicComment(props.token, x, y, name, body)
}

function cancelPlacement() {
  showPlacementModal.value = false
  pendingPlacement.value = null
}

function toggleCommentMode() {
  isCommentMode.value = !isCommentMode.value
}
</script>

<template>
  <div class="w-full h-full bg-white relative" @dblclick.capture.stop>
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
      :class="['w-full h-full', isCommentMode ? 'placing-comment' : '']"
      @pane-click="onPaneClick"
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

    <SketchCommentLayer mode="public" :canvas-id="PUBLIC_CANVAS_ID" />

    <div class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1 p-1 bg-white border border-gray-200 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.08)] z-10">
      <button
        type="button"
        :class="[
          'flex items-center justify-center w-9 h-9 rounded-md border-none cursor-pointer transition-colors duration-[120ms]',
          !isCommentMode ? 'bg-primary-500 text-white hover:bg-[#b8005e]' : 'text-gray-600 bg-transparent hover:bg-gray-100',
        ]"
        title="Selecteren"
        @click="isCommentMode = false"
      >
        <MousePointer2 :size="18" />
      </button>
      <button
        type="button"
        :class="[
          'flex items-center justify-center w-9 h-9 rounded-md border-none cursor-pointer transition-colors duration-[120ms]',
          isCommentMode ? 'bg-primary-500 text-white hover:bg-[#b8005e]' : 'text-gray-600 bg-transparent hover:bg-gray-100',
        ]"
        title="Comment plaatsen"
        @click="toggleCommentMode"
      >
        <MessageSquare :size="18" />
      </button>
    </div>

    <div
      v-if="showPlacementModal"
      class="absolute inset-0 bg-[rgba(15,23,42,0.45)] flex items-center justify-center z-[100]"
      @click.self="cancelPlacement"
    >
      <div class="bg-white rounded-[10px] py-5 px-[22px] w-[360px] max-w-[calc(100%-32px)] shadow-[0_12px_32px_rgba(0,0,0,0.2)] flex flex-col gap-3">
        <h2 class="m-0 text-base font-bold text-gray-900">Comment plaatsen</h2>
        <p class="m-0 text-xs text-gray-500">
          Je kunt een comment niet meer aanpassen nadat je hem plaatst.
        </p>
        <label v-if="needsName" class="flex flex-col gap-1 text-xs text-gray-700 font-semibold">
          Naam
          <input
            v-model="nameInput"
            type="text"
            maxlength="80"
            placeholder="Bijv. Jan Jansen"
            class="w-full py-2 px-2.5 text-sm border border-gray-300 rounded-md outline-none font-body font-normal text-gray-900 focus:border-primary-500"
            autofocus
          >
        </label>
        <label class="flex flex-col gap-1 text-xs text-gray-700 font-semibold">
          Opmerking
          <textarea
            v-model="bodyInput"
            rows="4"
            maxlength="5000"
            placeholder="Schrijf je opmerking..."
            class="w-full py-2 px-2.5 text-sm border border-gray-300 rounded-md outline-none font-body font-normal text-gray-900 focus:border-primary-500 resize-y min-h-[80px]"
            :autofocus="!needsName"
            @keydown.escape.prevent="cancelPlacement"
            @keydown.ctrl.enter.prevent="submitPlacement"
            @keydown.meta.enter.prevent="submitPlacement"
          />
        </label>
        <div class="flex justify-end gap-2 mt-1">
          <button
            type="button"
            class="py-1.5 px-3 text-[13px] rounded-md cursor-pointer border border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            @click="cancelPlacement"
          >Annuleren</button>
          <button
            type="button"
            class="py-1.5 px-3 text-[13px] rounded-md cursor-pointer border border-transparent bg-primary-500 text-white enabled:hover:bg-[#b8005e] disabled:bg-gray-300 disabled:cursor-not-allowed"
            :disabled="!canSubmit"
            @click="submitPlacement"
          >
            Plaatsen
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.placing-comment :deep(.vue-flow__pane) {
  cursor: crosshair;
}
</style>
