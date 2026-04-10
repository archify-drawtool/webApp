<script setup lang="ts">

import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Server, Database, LayoutDashboard, User, Square } from 'lucide-vue-next'

const props = defineProps<NodeProps<{ label?: string }>>()
defineEmits(['updateNodeInternals'])

const { nodeTypes } = useNodeTypes()

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
  <div class="flex flex-col items-center gap-2 p-3">
    <component :is="icon" :size="24" />
    <span v-if="data.label" class="text-xs">{{ data.label }}</span>
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
