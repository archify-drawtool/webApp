<script setup lang="ts">
import { MapPin, Trash2, Check, Send, Pencil } from 'lucide-vue-next'
import type { Comment } from '~/types/Comment'

const props = defineProps<{
  comment: Comment
  replies: Comment[]
  screenX: number
  screenY: number
  autoOpen?: boolean
}>()

const emit = defineEmits<{
  drag: [payload: { id: number; screenX: number; screenY: number }]
  dragEnd: [payload: { id: number; screenX: number; screenY: number }]
  updateBody: [payload: { id: number; body: string }]
  reply: [payload: { parentId: number; body: string }]
  resolve: [parentId: number]
  deleteReply: [id: number]
}>()

const open = ref(false)
const popoverRef = ref<HTMLElement | null>(null)
const textareaRef = ref<HTMLTextAreaElement | null>(null)
const replyInputRef = ref<HTMLTextAreaElement | null>(null)
const isDragging = ref(false)
const isHovered = ref(false)

const editingBody = ref(false)
const bodyDraft = ref(props.comment.body)
const replyDraft = ref('')

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

const replyCount = computed(() => props.replies.length)

watch(() => props.comment.body, body => {
  if (!editingBody.value) bodyDraft.value = body
})

watch(() => props.autoOpen, value => {
  if (value) openPopover(true)
})

function openPopover(startInEdit = false) {
  if (open.value) return
  open.value = true
  bodyDraft.value = props.comment.body
  if (startInEdit || props.comment.body === '') {
    startBodyEdit()
  }
}

function closePopover() {
  if (!open.value) return
  if (editingBody.value) commitBodyEdit()
  replyDraft.value = ''
  open.value = false
}

function startBodyEdit() {
  editingBody.value = true
  bodyDraft.value = props.comment.body
  nextTick(() => {
    textareaRef.value?.focus()
    textareaRef.value?.select()
  })
}

function commitBodyEdit() {
  if (!editingBody.value) return
  editingBody.value = false
  const trimmed = bodyDraft.value.trim()
  if (trimmed !== props.comment.body) {
    emit('updateBody', { id: props.comment.id, body: trimmed })
  }
}

function cancelBodyEdit() {
  editingBody.value = false
  bodyDraft.value = props.comment.body
}

function submitReply() {
  const trimmed = replyDraft.value.trim()
  if (!trimmed) return
  emit('reply', { parentId: props.comment.id, body: trimmed })
  replyDraft.value = ''
  nextTick(() => replyInputRef.value?.focus())
}

function onResolve() {
  if (!window.confirm('Weet je zeker dat je deze thread wilt resolven? De comment en alle replies worden verwijderd.')) return
  emit('resolve', props.comment.id)
}

function onDeleteReply(id: number) {
  emit('deleteReply', id)
}

function onPinClick() {
  if (isDragging.value) return
  openPopover()
}

function onPointerDown(event: PointerEvent) {
  if (event.button !== 0 || open.value) return
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
    if (editingBody.value) cancelBodyEdit()
    else closePopover()
  }
}

function formatTime(iso: string): string {
  const date = new Date(iso)
  return new Intl.DateTimeFormat('nl-NL', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}

function authorName(comment: Comment): string {
  return comment.author?.name ?? 'Onbekend'
}

onMounted(() => {
  document.addEventListener('mousedown', onDocumentMousedown, true)
  window.addEventListener('keydown', onKeydown)
  if (props.autoOpen) openPopover(true)
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
      :class="{ 'pin-button--active': open }"
      aria-label="Comment"
      @pointerdown="onPointerDown"
      @click.stop="onPinClick"
    >
      <MapPin :size="20" :stroke-width="2.5" />
    </button>

    <span
      v-if="replyCount > 0"
      class="reply-badge"
      :aria-label="`${replyCount} replies`"
    >{{ replyCount }}</span>

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

      <div class="thread-header">
        <div class="entry-meta">
          <span class="entry-author">{{ authorName(comment) }}</span>
          <span class="entry-time">{{ formatTime(comment.created_at) }}</span>
        </div>
        <button class="thread-resolve" @click="onResolve">
          <Check :size="13" />
          <span>Resolven</span>
        </button>
      </div>

      <div class="thread-body">
        <textarea
          v-if="editingBody"
          ref="textareaRef"
          v-model="bodyDraft"
          rows="3"
          placeholder="Schrijf een opmerking..."
          class="body-textarea"
          @keydown.enter.exact.prevent="commitBodyEdit"
          @keydown.escape="cancelBodyEdit"
          @blur="commitBodyEdit"
        />
        <div
          v-else
          class="body-display"
          @click="startBodyEdit"
        >
          <p v-if="comment.body" class="body-text">{{ comment.body }}</p>
          <p v-else class="body-placeholder">Klik om een opmerking te schrijven</p>
          <Pencil class="body-edit-icon" :size="12" />
        </div>
      </div>

      <div v-if="replies.length > 0" class="thread-replies">
        <div
          v-for="reply in replies"
          :key="reply.id"
          class="reply"
        >
          <div class="entry-meta">
            <span class="entry-author">{{ authorName(reply) }}</span>
            <span class="entry-time">{{ formatTime(reply.created_at) }}</span>
            <button
              class="reply-delete"
              :aria-label="`Verwijder reply van ${authorName(reply)}`"
              @click="onDeleteReply(reply.id)"
            >
              <Trash2 :size="11" />
            </button>
          </div>
          <p class="reply-body">{{ reply.body }}</p>
        </div>
      </div>

      <div class="reply-input">
        <textarea
          ref="replyInputRef"
          v-model="replyDraft"
          rows="1"
          placeholder="Reageer..."
          class="reply-textarea"
          @keydown.enter.exact.prevent="submitReply"
        />
        <button
          class="reply-submit"
          :disabled="!replyDraft.trim()"
          aria-label="Verstuur reply"
          @click="submitReply"
        >
          <Send :size="14" />
        </button>
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

.pin-button:hover,
.pin-button--active {
  background: var(--color-primary-600, #b8005e);
}

.pin-button :deep(svg) {
  transform: rotate(45deg);
}

.reply-badge {
  position: absolute;
  top: -2px;
  right: -10px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 9px;
  background: var(--color-secondary-900, #1f2937);
  color: white;
  font-size: 11px;
  line-height: 18px;
  text-align: center;
  font-weight: 600;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  pointer-events: none;
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
  width: 280px;
  max-height: 420px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.18);
  padding: 14px 10px 10px 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow: hidden;
  z-index: 60;
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

.thread-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.thread-resolve {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 11px;
  color: #047857;
  background: #ecfdf5;
  border: 1px solid #a7f3d0;
  border-radius: 4px;
  padding: 3px 6px;
  cursor: pointer;
}

.thread-resolve:hover {
  background: #d1fae5;
}

.entry-meta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  color: #6b7280;
}

.entry-author {
  font-weight: 600;
  color: #111827;
}

.entry-time {
  font-size: 10px;
}

.thread-body {
  border-bottom: 1px solid #f3f4f6;
  padding-bottom: 10px;
}

.body-display {
  position: relative;
  cursor: text;
  padding: 2px 18px 2px 2px;
  border-radius: 4px;
  max-height: 140px;
  overflow-y: auto;
}

.body-display:hover {
  background: #f9fafb;
}

.body-display:hover .body-edit-icon {
  opacity: 1;
}

.body-text {
  font-size: 13px;
  line-height: 1.4;
  color: #1f2937;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.body-placeholder {
  font-size: 13px;
  color: #9ca3af;
  font-style: italic;
  margin: 0;
}

.body-edit-icon {
  position: absolute;
  top: 4px;
  right: 4px;
  color: #9ca3af;
  opacity: 0;
  transition: opacity 120ms;
}

.body-textarea {
  width: 100%;
  resize: none;
  min-height: 60px;
  max-height: 180px;
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

.body-textarea:focus {
  border-color: var(--color-primary-500);
}

.thread-replies {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  max-height: 180px;
  padding-right: 4px;
}

.reply {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.reply .entry-meta {
  display: flex;
  align-items: center;
}

.reply-delete {
  margin-left: auto;
  color: #9ca3af;
  background: transparent;
  border: none;
  padding: 2px;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0;
  transition: opacity 120ms;
}

.reply:hover .reply-delete {
  opacity: 1;
}

.reply-delete:hover {
  background: #fee2e2;
  color: #b91c1c;
}

.reply-body {
  font-size: 13px;
  line-height: 1.4;
  color: #1f2937;
  white-space: pre-wrap;
  word-break: break-word;
  margin: 0;
}

.reply-input {
  display: flex;
  align-items: flex-end;
  gap: 6px;
  border-top: 1px solid #f3f4f6;
  padding-top: 10px;
}

.reply-textarea {
  flex: 1;
  resize: none;
  min-height: 30px;
  max-height: 100px;
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

.reply-textarea:focus {
  border-color: var(--color-primary-500);
}

.reply-submit {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  color: white;
  background: var(--color-primary-500);
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.reply-submit:hover:not(:disabled) {
  background: var(--color-primary-600, #b8005e);
}

.reply-submit:disabled {
  background: #d1d5db;
  cursor: not-allowed;
}
</style>
