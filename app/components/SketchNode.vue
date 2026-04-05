<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'
import { Server, Database, LayoutDashboard, User, Square } from 'lucide-vue-next'

const props = defineProps<NodeProps<{ label?: string }>>()

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
  <Handle type="target" :position="Position.Top" />
  <div class="flex flex-col items-center gap-2 p-3">
    <component :is="icon" :size="24" />
    <span v-if="data.label" class="text-xs">{{ data.label }}</span>
  </div>
  <Handle type="source" :position="Position.Bottom" />
</template>
