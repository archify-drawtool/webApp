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
type EdgeToolId = ReturnType<typeof useEdgeTool>['activeEdgeTool']['value']
const { selectedNodeType, setNodeType } = useNodeTool()

const nodeDropdownOpen = ref(false)
const edgeDropdownOpen = ref(false)
const anyOpen = computed(() => nodeDropdownOpen.value || edgeDropdownOpen.value)

const iconComponents: Record<string, Component> = {
  server: Server,
  database: Database,
  'layout-dashboard': LayoutDashboard,
  user: User,
  square: Square,
  'arrow-right': ArrowRight,
  'arrow-left-right': ArrowLeftRight,
  minus: Minus,
}

function iconFor(name: string): Component {
  return iconComponents[name] ?? Square
}

const selectedNodeTypeObj = computed(() =>
  nodeTypes.value.find(nt => nt.type === selectedNodeType.value) ?? nodeTypes.value[0],
)

const activeEdgeIcon = computed(() => {
  const tool = EDGE_TOOLS.find(t => t.id === activeEdgeTool.value)
  return iconFor(tool?.icon ?? 'arrow-right')
})

const nodeDropdownItems = computed(() =>
  nodeTypes.value.map(nt => ({ key: nt.type, icon: iconFor(nt.icon), label: nt.name })),
)

const edgeDropdownItems = computed(() =>
  EDGE_TOOLS.map(t => ({ key: t.id, icon: iconFor(t.icon), label: t.label })),
)

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

function selectNodeType(key: string) {
  setNodeType(key)
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
        <button
          class="rounded-full p-2 hover:bg-secondary-700 text-grey-200 transition-colors"
          title="Select a node type"
          @click.stop="toggleNodeDropdown"
        >
          <component :is="iconFor(selectedNodeTypeObj?.icon ?? 'square')" :size="18" />
        </button>
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

    <SketchToolbarDropdown
      v-if="nodeDropdownOpen"
      :items="nodeDropdownItems"
      :selected-key="selectedNodeType"
      @select="selectNodeType"
    />

    <SketchToolbarDropdown
      v-if="edgeDropdownOpen"
      :items="edgeDropdownItems"
      :selected-key="activeEdgeTool"
      align-right
      @select="key => { setEdgeTool(key as EdgeToolId); edgeDropdownOpen = false }"
    />
  </Panel>
</template>
