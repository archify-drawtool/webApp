<script setup lang="ts">
import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const { viewport } = useVueFlow(SKETCH_CANVAS_ID)
const { comments, updateCommentPosition, updateCommentBody, deleteComment } = useComments()

const autoOpenId = useState<number | null>('comment-auto-open-id', () => null)

const dragOverrides = ref<Map<number, { screenX: number; screenY: number }>>(new Map())

const pins = computed(() =>
  comments.value.map(c => {
    const override = dragOverrides.value.get(c.id)
    return {
      id: c.id,
      comment: c,
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

function onDelete(id: number) {
  void deleteComment(id)
  if (autoOpenId.value === id) autoOpenId.value = null
}
</script>

<template>
  <div class="comment-layer">
    <SketchCommentPin
      v-for="pin in pins"
      :key="pin.id"
      :comment="pin.comment"
      :screen-x="pin.screenX"
      :screen-y="pin.screenY"
      :auto-open="pin.autoOpen"
      @drag="onDrag"
      @drag-end="onDragEnd"
      @update-body="onUpdateBody"
      @delete="onDelete"
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
