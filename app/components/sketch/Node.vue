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
  updateNodeData(props.id, { label: editValue.value })
}

function cancelEdit() {
  editing.value = false
}
</script>

<template>
  <Handle type="target" :position="Position.Top" />
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
    <span v-else class="text-xs">{{ data.label }}</span>
  </div>
  <Handle type="source" :position="Position.Bottom" />
</template>
