<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { resolveIcon } from '~/utils/lucideIcon'

const props = defineProps<NodeProps<{ label?: string }>>()
defineEmits(['updateNodeInternals'])

const { nodeTypes } = useNodeTypes()
const { updateNodeLabelWithHistory } = useSketchCanvas()

const icon = computed(() => {
  const iconName = nodeTypes.value.find(t => t.type === props.type)?.icon
  return resolveIcon(iconName ?? '')
})

const editing = ref(false)
const editValue = ref('')
const inputRef = ref<HTMLInputElement | null>(null)

function startEdit() {
  editValue.value = props.data.label ?? ''
  editing.value = true
  nextTick(() => inputRef.value?.focus())
}

function confirmEdit() {
  if (!editing.value) return
  editing.value = false
  updateNodeLabelWithHistory(props.id, editValue.value)
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <Handle id="top-target" type="target" :position="Position.Top" />
  <Handle id="top-source" type="source" :position="Position.Top" />
  <Handle id="right-target" type="target" :position="Position.Right" />
  <Handle id="right-source" type="source" :position="Position.Right" />
  <Handle id="bottom-target" type="target" :position="Position.Bottom" />
  <Handle id="bottom-source" type="source" :position="Position.Bottom" />
  <Handle id="left-target" type="target" :position="Position.Left" />
  <Handle id="left-source" type="source" :position="Position.Left" />
  <div class="flex flex-col items-center gap-2 p-3" @dblclick.stop="startEdit">
    <component :is="icon" :size="24" />
    <input
      v-if="editing"
      ref="inputRef"
      v-model="editValue"
      class="text-xs text-center bg-transparent border-b border-gray-400 outline-none w-full"
      @keydown.enter="confirmEdit"
      @keydown.escape="cancelEdit"
      @blur="confirmEdit"
      @click.stop
      @mousedown.stop
      @dblclick.stop
    >
    <span v-else class="text-xs max-w-24 break-words text-center block">{{ data.label }}</span>
  </div>
</template>

<style scoped>
:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background-color: #E5097F;
  border: 2px solid white;
  border-radius: 50%;
  opacity: 1;
}
</style>
