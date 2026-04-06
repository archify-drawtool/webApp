<script setup lang="ts">
import { Panel } from '@vue-flow/core'
import {
  ChevronUp,
  ArrowRight,
  ArrowLeftRight,
  Minus,
  Server,
  Database,
  LayoutDashboard,
  User,
  Square,
} from 'lucide-vue-next'

const { nodeTypes } = useNodeTypes()
const { activeEdgeTool, setEdgeTool, EDGE_TOOLS } = useEdgeTool()
const { pendingNodeType, activateNodeType, clearNodeType } = useNodeTool()

const nodeDropdownOpen = ref(false)
const edgeDropdownOpen = ref(false)
const anyOpen = computed(() => nodeDropdownOpen.value || edgeDropdownOpen.value)

const iconComponents: Record<string, Component> = {
  server: Server,
  database: Database,
  'layout-dashboard': LayoutDashboard,
  user: User,
  square: Square,
}

const edgeIconComponents: Record<string, Component> = {
  'arrow-right': ArrowRight,
  'arrow-left-right': ArrowLeftRight,
  minus: Minus,
}

function iconFor(name: string): Component {
  return iconComponents[name] ?? edgeIconComponents[name] ?? Square
}

const activeNodeType = computed(() =>
  nodeTypes.value.find(nt => nt.type === pendingNodeType.value) ?? nodeTypes.value[0],
)

const activeEdgeIcon = computed(() => {
  const tool = EDGE_TOOLS.find(t => t.id === activeEdgeTool.value)
  return iconFor(tool?.icon ?? 'arrow-right')
})

function toggleNodeDropdown() {
  edgeDropdownOpen.value = false
  nodeDropdownOpen.value = !nodeDropdownOpen.value
}

function toggleEdgeDropdown() {
  nodeDropdownOpen.value = false
  edgeDropdownOpen.value = !edgeDropdownOpen.value
}

function closeAll() {
  nodeDropdownOpen.value = false
  edgeDropdownOpen.value = false
}

function selectNodeType(type: string) {
  if (pendingNodeType.value === type) {
    clearNodeType()
  } else {
    activateNodeType(type)
  }
  nodeDropdownOpen.value = false
}
</script>

<template>
  <Panel position="bottom-center">
    <!-- Backdrop to close dropdowns on outside click -->
    <div v-if="anyOpen" class="fixed inset-0 z-40" @mousedown.stop="closeAll" />

    <!-- Pill -->
    <div class="relative z-50 flex items-center gap-1 rounded-full bg-secondary-900 border border-secondary-700 shadow-lg px-1 py-1">

      <!-- Node tool section -->
      <div class="flex items-center">
        <!-- Active node icon: click to toggle pending off -->
        <button
          class="rounded-full p-2 hover:bg-secondary-700 transition-colors"
          :class="pendingNodeType ? 'text-primary-500' : 'text-grey-200'"
          :title="pendingNodeType ? 'Click canvas to place node (Esc to cancel)' : 'Select a node type'"
          @click.stop="pendingNodeType ? clearNodeType() : toggleNodeDropdown()"
        >
          <component :is="iconFor(activeNodeType?.icon ?? 'square')" :size="18" />
        </button>
        <!-- Dropdown toggle -->
        <button
          class="rounded-full p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          @click.stop="toggleNodeDropdown"
        >
          <ChevronUp :size="14" />
        </button>
      </div>

      <!-- Divider -->
      <div class="w-px h-5 bg-secondary-700" />

      <!-- Edge tool section -->
      <div class="flex items-center">
        <div class="rounded-full p-2 text-grey-200">
          <component :is="activeEdgeIcon" :size="18" />
        </div>
        <button
          class="rounded-full p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          @click.stop="toggleEdgeDropdown"
        >
          <ChevronUp :size="14" />
        </button>
      </div>
    </div>

    <!-- Node dropdown -->
    <div
      v-if="nodeDropdownOpen"
      class="absolute bottom-full mb-2 left-0 rounded-xl bg-secondary-900 border border-secondary-700 shadow-xl p-1 z-50"
    >
      <button
        v-for="nt in nodeTypes"
        :key="nt.type"
        class="flex items-center gap-2 px-3 py-2 rounded-lg w-full hover:bg-secondary-700 transition-colors"
        :class="pendingNodeType === nt.type ? 'text-primary-500' : 'text-grey-100'"
        @click.stop="selectNodeType(nt.type)"
      >
        <component :is="iconFor(nt.icon)" :size="16" />
        <span class="text-sm">{{ nt.name }}</span>
      </button>
    </div>

    <!-- Edge dropdown -->
    <div
      v-if="edgeDropdownOpen"
      class="absolute bottom-full mb-2 right-0 rounded-xl bg-secondary-900 border border-secondary-700 shadow-xl p-1 z-50"
    >
      <button
        v-for="tool in EDGE_TOOLS"
        :key="tool.id"
        class="flex items-center gap-2 px-3 py-2 rounded-lg w-full hover:bg-secondary-700 transition-colors"
        :class="activeEdgeTool === tool.id ? 'text-primary-500' : 'text-grey-200'"
        @click.stop="setEdgeTool(tool.id); edgeDropdownOpen = false"
      >
        <component :is="iconFor(tool.icon)" :size="16" />
        <span class="text-sm">{{ tool.label }}</span>
      </button>
    </div>
  </Panel>
</template>
