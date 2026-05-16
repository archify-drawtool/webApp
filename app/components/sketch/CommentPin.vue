<script setup lang="ts">
import { MapPin, Trash2 } from 'lucide-vue-next'
import type { Comment } from '~/types/Comment'

const props = defineProps<{
  comment: Comment
  screenX: number
  screenY: number
  autoOpen?: boolean
}>()

const emit = defineEmits<{
  drag: [payload: { id: number; screenX: number; screenY: number }]
  dragEnd: [payload: { id: number; screenX: number; screenY: number }]
  updateBody: [payload: { id: number; body: string }]
  delete: [id: number]
}>()

const { isDragToolActive } = useDragTool()

const open = ref(false)
const editValue = ref(props.comment.body)
const popoverRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const isDragging = ref(false)
const isHovered = ref(false)

let dragStartScreenX = 0
let dragStartScreenY = 0
let dragOriginX = 0
let dragOriginY = 0
let movedDuringDrag = false
let resizeStartY = 0
let resizeStartHeight = 0

const showTooltip = computed(() =>
  !open.value && !isDragging.value && props.comment.body.trim().length > 0 && isHovered.value,
)

watch(() => props.comment.body, body => {
  if (!open.value) editValue.value = body
})

watch(() => props.autoOpen, value => {
  if (value) openPopover()
})

function openPopover() {
  if (open.value) return
  open.value = true
  editValue.value = props.comment.body
  nextTick(() => {
    textareaRef.value?.focus()
    textareaRef.value?.select()
  })
}

function closePopover() {
  if (!open.value) return
  open.value = false
  const trimmed = editValue.value.trim()
  if (trimmed !== props.comment.body) {
    emit('updateBody', { id: props.comment.id, body: trimmed })
  }
}

function onPinClick() {
  if (isDragToolActive.value || isDragging.value) return
  openPopover()
}

function onDelete() {
  emit('delete', props.comment.id)
}

function onPointerDown(event: PointerEvent) {
  if (isDragToolActive.value || event.button !== 0 || open.value) return
  event.stopPropagation()
  dragStartScreenX = event.clientX
  dragStartScreenY = event.clientY
  dragOriginX = props.screenX
  dragOriginY = props.screenY
  movedDuringDrag = false
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp, { once: true })
}

function onPointerMove(event: PointerEvent) {
  const dx = event.clientX - dragStartScreenX
  const dy = event.clientY - dragStartScreenY
  if (!movedDuringDrag && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
    movedDuringDrag = true
    isDragging.value = true
  }
  if (!movedDuringDrag) return
  emit('drag', {
    id: props.comment.id,
    screenX: dragOriginX + dx,
    screenY: dragOriginY + dy,
  })
}

function onPointerUp(event: PointerEvent) {
  window.removeEventListener('pointermove', onPointerMove)
  if (!movedDuringDrag) return
  const dx = event.clientX - dragStartScreenX
  const dy = event.clientY - dragStartScreenY
  emit('dragEnd', {
    id: props.comment.id,
    screenX: dragOriginX + dx,
    screenY: dragOriginY + dy,
  })
  setTimeout(() => {
    isDragging.value = false
  }, 0)
}

function onResizeStart(event: PointerEvent) {
  if (event.button !== 0 || !textareaRef.value) return
  event.preventDefault()
  event.stopPropagation()
  resizeStartY = event.clientY
  resizeStartHeight = textareaRef.value.offsetHeight
  window.addEventListener('pointermove', onResizeMove)
  window.addEventListener('pointerup', onResizeEnd, { once: true })
}

function onResizeMove(event: PointerEvent) {
  if (!textareaRef.value) return
  const dy = resizeStartY - event.clientY
  const newHeight = Math.max(40, resizeStartHeight + dy)
  textareaRef.value.style.height = newHeight + 'px'
}

function onResizeEnd() {
  window.removeEventListener('pointermove', onResizeMove)
}

function onDocumentMousedown(event: MouseEvent) {
  if (!open.value) return
  if (popoverRef.value?.contains(event.target as Node)) return
  closePopover()
}

function onKeydown(event: KeyboardEvent) {
  if (!open.value) return
  if (event.key === 'Escape') {
    event.stopPropagation()
    closePopover()
  }
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown, true)
  window.addEventListener('keydown', onKeydown)
  if (props.autoOpen) openPopover()
})

onUnmounted(() => {
  document.removeEventListener('mousedown', onDocumentMousedown, true)
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('pointermove', onPointerMove)
  window.removeEventListener('pointermove', onResizeMove)
})
</script>

<template>
  <div
    class="comment-pin"
    :style="{ left: screenX + 'px', top: screenY + 'px' }"
    @mouseenter="isHovered = true"
    @mouseleave="isHovered = false"
  >
    <button
      class="pin-button"
      :class="{ 'pin-button--active': open, 'pin-button--no-interact': isDragToolActive }"
      aria-label="Comment"
      @pointerdown="onPointerDown"
      @click.stop="onPinClick"
    >
      <MapPin :size="20" :stroke-width="2.5" />
    </button>

    <div
      v-if="showTooltip"
      class="comment-tooltip"
      aria-hidden="true"
    >
      {{ comment.body }}
    </div>

    <div
      v-if="open"
      ref="popoverRef"
      class="comment-popover"
      @mousedown.stop
      @click.stop
    >
      <div class="popover-resize-grip" @pointerdown="onResizeStart">
        <svg viewBox="0 0 10 10" width="10" height="10" aria-hidden="true">
          <line x1="0" y1="6" x2="6" y2="0" stroke="currentColor" stroke-width="1" />
          <line x1="0" y1="10" x2="10" y2="0" stroke="currentColor" stroke-width="1" />
        </svg>
      </div>
      <textarea
        ref="textareaRef"
        v-model="editValue"
        rows="3"
        placeholder="Schrijf een opmerking..."
        class="popover-textarea"
        @keydown.enter.exact.prevent="closePopover"
      />
      <div class="popover-actions">
        <button class="popover-delete" @click="onDelete">
          <Trash2 :size="14" />
          <span>Verwijderen</span>
        </button>
        <button class="popover-close" @click="closePopover">Klaar</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.comment-pin {
  position: absolute;
  transform: translate(-50%, -100%);
  pointer-events: auto;
}

.pin-button {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--color-primary-500);
  color: white;
  border: 2px solid white;
  border-radius: 50% 50% 50% 0;
  transform: rotate(-45deg);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: grab;
  transition: background-color 120ms;
}

.pin-button:active {
  cursor: grabbing;
}

.pin-button--no-interact {
  cursor: default;
  pointer-events: none;
}

.pin-button:hover,
.pin-button--active {
  background: var(--color-primary-600, #b8005e);
}

.pin-button :deep(svg) {
  transform: rotate(45deg);
}

.comment-tooltip {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  width: max-content;
  max-width: 220px;
  padding: 6px 8px;
  background: rgba(17, 24, 39, 0.92);
  color: white;
  font-size: 12px;
  line-height: 1.4;
  border-radius: 6px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  pointer-events: none;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  z-index: 55;
}

.comment-popover {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  width: 260px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 14px 10px 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  z-index: 60;
}

.popover-textarea {
  width: 100%;
  resize: none;
  min-height: 60px;
  font-size: 13px;
  line-height: 1.4;
  color: #1f2937;
  background: white;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 6px 8px;
  outline: none;
  font-family: inherit;
}

.popover-textarea:focus {
  border-color: var(--color-primary-500);
}

.popover-resize-grip {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 10px;
  height: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  cursor: nw-resize;
}

.popover-resize-grip svg {
  width: 10px;
  height: 10px;
}

.popover-resize-grip:hover {
  color: #4b5563;
}

.popover-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.popover-delete {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #b91c1c;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px 6px;
  border-radius: 4px;
}

.popover-delete:hover {
  background: #fee2e2;
}

.popover-close {
  font-size: 12px;
  color: white;
  background: var(--color-primary-500);
  border: none;
  border-radius: 4px;
  padding: 4px 12px;
  cursor: pointer;
}

.popover-close:hover {
  background: var(--color-primary-600, #b8005e);
}
</style>
