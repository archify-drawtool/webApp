<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const props = withDefaults(defineProps<{
  mode?: 'editor' | 'public'
  canvasId?: string
}>(), {
  mode: 'editor',
  canvasId: SKETCH_CANVAS_ID,
})

const route = useRoute()
const { viewport } = useVueFlow(props.canvasId)
const {
  comments,
  getReplies,
  updateCommentPosition,
  updateCommentBody,
  deleteComment,
  resolveThread,
  addReply,
} = useComments()
const { success: toastSuccess, error: toastError } = useToast()

const autoOpenId = useState<number | null>('comment-auto-open-id', () => null)

const dragOverrides = ref<Map<number, { screenX: number; screenY: number }>>(new Map())

const pins = computed(() =>
  comments.value
    .filter(c => c.parent_id === null)
    .map(c => {
      const override = dragOverrides.value.get(c.id)
      return {
        id: c.id,
        comment: c,
        replies: getReplies(c.id),
        screenX: override?.screenX ?? c.x * viewport.value.zoom + viewport.value.x,
        screenY: override?.screenY ?? c.y * viewport.value.zoom + viewport.value.y,
        autoOpen: autoOpenId.value === c.id,
      }
    }),
)

function onDrag({ id, screenX, screenY }: { id: number; screenX: number; screenY: number }) {
  dragOverrides.value.set(id, { screenX, screenY })
  dragOverrides.value = new Map(dragOverrides.value)
}

function onDragEnd({ id, screenX, screenY }: { id: number; screenX: number; screenY: number }) {
  dragOverrides.value.delete(id)
  dragOverrides.value = new Map(dragOverrides.value)
  const flowX = (screenX - viewport.value.x) / viewport.value.zoom
  const flowY = (screenY - viewport.value.y) / viewport.value.zoom
  void updateCommentPosition(id, flowX, flowY)
}

function onUpdateBody({ id, body }: { id: number; body: string }) {
  void updateCommentBody(id, body)
  if (autoOpenId.value === id) autoOpenId.value = null
}

function onReply({ parentId, body }: { parentId: number; body: string }) {
  const sketchId = Number(route.params.id)
  if (!Number.isFinite(sketchId)) return
  void addReply(sketchId, parentId, body)
}

async function onResolve(parentId: number) {
  try {
    await resolveThread(parentId)
    if (autoOpenId.value === parentId) autoOpenId.value = null
    toastSuccess('Comment succesvol opgelost')
  } catch {
    toastError('Het oplossen van de comment is mislukt. Probeer het opnieuw.')
  }
}

function onDeleteReply(id: number) {
  void deleteComment(id)
}
</script>

<template>
  <div class="comment-layer">
    <SketchCommentPin
      v-for="pin in pins"
      :key="pin.id"
      :comment="pin.comment"
      :replies="pin.replies"
      :screen-x="pin.screenX"
      :screen-y="pin.screenY"
      :auto-open="pin.autoOpen"
      :readonly="mode === 'public'"
      @drag="onDrag"
      @drag-end="onDragEnd"
      @update-body="onUpdateBody"
      @reply="onReply"
      @resolve="onResolve"
      @delete-reply="onDeleteReply"
    />
  </div>
</template>

<style scoped>
.comment-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
  z-index: 5;
}
</style>
