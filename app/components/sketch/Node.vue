<script setup lang="ts">
import { Handle, Position, type NodeProps, useVueFlow } from '@vue-flow/core'
import { Server, Database, LayoutDashboard, User, Square } from 'lucide-vue-next'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const props = defineProps<NodeProps<{ label?: string }>>()
defineEmits(['updateNodeInternals'])

const { nodeTypes } = useNodeTypes()
const { updateNodeData } = useVueFlow(SKETCH_CANVAS_ID)

const iconComponents: Record<string, Component> = {
  server: Server,
  database: Database,
  'layout-dashboard': LayoutDashboard,
  user: User,
  square: Square,
}

const icon = computed(() => {
  const iconName = nodeTypes.value.find(t => t.type === props.type)?.icon
  return iconComponents[iconName ?? ''] ?? Square
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
  const { snapshot } = useSketchHistory()
  snapshot()
  updateNodeData(props.id, { label: editValue.value })
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
