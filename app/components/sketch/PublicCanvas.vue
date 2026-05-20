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

    <div class="public-toolbar">
      <button
        type="button"
        class="tool-button"
        :class="{ 'tool-button--active': !isCommentMode }"
        title="Selecteren"
        @click="isCommentMode = false"
      >
        <MousePointer2 :size="18" />
      </button>
      <button
        type="button"
        class="tool-button"
        :class="{ 'tool-button--active': isCommentMode }"
        title="Comment plaatsen"
        @click="toggleCommentMode"
      >
        <MessageSquare :size="18" />
      </button>
    </div>

    <div v-if="showPlacementModal" class="placement-backdrop" @click.self="cancelPlacement">
      <div class="placement-dialog">
        <h2 class="placement-title">Comment plaatsen</h2>
        <p class="placement-help">
          Je kunt een comment niet meer aanpassen nadat je hem plaatst.
        </p>
        <label v-if="needsName" class="placement-label">
          Naam
          <input
            v-model="nameInput"
            type="text"
            maxlength="80"
            placeholder="Bijv. Jan Jansen"
            class="placement-input"
            autofocus
          >
        </label>
        <label class="placement-label">
          Opmerking
          <textarea
            v-model="bodyInput"
            rows="4"
            maxlength="5000"
            placeholder="Schrijf je opmerking..."
            class="placement-textarea"
            :autofocus="!needsName"
            @keydown.escape.prevent="cancelPlacement"
            @keydown.ctrl.enter.prevent="submitPlacement"
            @keydown.meta.enter.prevent="submitPlacement"
          />
        </label>
        <div class="placement-actions">
          <button type="button" class="placement-cancel" @click="cancelPlacement">Annuleren</button>
          <button
            type="button"
            class="placement-confirm"
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

.public-toolbar {
  position: absolute;
  bottom: 16px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 4px;
  padding: 4px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  z-index: 10;
}

.tool-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  color: #4b5563;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: background-color 120ms, color 120ms;
}

.tool-button:hover {
  background: #f3f4f6;
}

.tool-button--active {
  background: var(--color-primary-500);
  color: white;
}

.tool-button--active:hover {
  background: var(--color-primary-600, #b8005e);
}

.placement-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.placement-dialog {
  background: white;
  border-radius: 10px;
  padding: 20px 22px;
  width: 360px;
  max-width: calc(100% - 32px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.placement-title {
  margin: 0;
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.placement-help {
  margin: 0;
  font-size: 12px;
  color: #6b7280;
}

.placement-label {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: #374151;
  font-weight: 600;
}

.placement-input,
.placement-textarea {
  width: 100%;
  padding: 8px 10px;
  font-size: 14px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  outline: none;
  font-family: inherit;
  font-weight: 400;
  color: #111827;
}

.placement-textarea {
  resize: vertical;
  min-height: 80px;
}

.placement-input:focus,
.placement-textarea:focus {
  border-color: var(--color-primary-500);
}

.placement-actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 4px;
}

.placement-cancel,
.placement-confirm {
  padding: 6px 12px;
  font-size: 13px;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid transparent;
}

.placement-cancel {
  background: white;
  border-color: #d1d5db;
  color: #374151;
}

.placement-cancel:hover {
  background: #f9fafb;
}

.placement-confirm {
  background: var(--color-primary-500);
  color: white;
}

.placement-confirm:hover:not(:disabled) {
  background: var(--color-primary-600, #b8005e);
}

.placement-confirm:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
