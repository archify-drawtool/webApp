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
  Type,
} from 'lucide-vue-next'

const { nodeTypes } = useNodeTypes()
const { activeEdgeTool, setEdgeTool, EDGE_TOOLS } = useEdgeTool()
type EdgeToolId = ReturnType<typeof useEdgeTool>['activeEdgeTool']['value']
const { selectedNodeType, isPlacingNode, setNodeType, stopPlacing } = useNodeTool()

type DropdownId = 'node' | 'edge'
const activeDropdown = ref<DropdownId | null>(null)
const anyOpen = computed(() => activeDropdown.value !== null)

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

function toggle(id: DropdownId) {
  activeDropdown.value = activeDropdown.value === id ? null : id
}

function closeAll() {
  activeDropdown.value = null
}

function selectNodeType(key: string) {
  setNodeType(key)
  activeDropdown.value = null
}

function togglePlacingMode() {
  if (isPlacingNode.value) {
    stopPlacing()
  } else {
    // Zorg dat er altijd een type geselecteerd is (val terug op eerste beschikbare type)
    if (!selectedNodeType.value && nodeTypes.value.length > 0) {
      setNodeType(nodeTypes.value[0].type)
    } else {
      isPlacingNode.value = true
    }
  }
}

function handleEscape(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    if (isPlacingNode.value) {
      stopPlacing()
    } else {
      closeAll()
    }
  }
}

onMounted(() => window.addEventListener('keydown', handleEscape))
onUnmounted(() => window.removeEventListener('keydown', handleEscape))
</script>

<template>
  <Panel position="bottom-center">
    <!-- Backdrop to close dropdowns on outside click -->
    <div v-if="anyOpen" class="fixed inset-0 z-40" @mousedown.stop="closeAll" />

    <div class="relative z-50 flex items-center gap-1 rounded-xl bg-secondary-900 shadow-lg px-3 py-2">

      <!-- Node tool section -->
      <div class="flex items-center">
        <button
          :class="[
            'rounded-md p-2 transition-colors',
            isPlacingNode
              ? 'bg-primary-500 text-white cursor-crosshair'
              : 'hover:bg-secondary-700 text-grey-200 cursor-pointer',
          ]"
          :title="isPlacingNode ? 'Klik op het canvas om een node te plaatsen (Escape om te annuleren)' : 'Selecteer een node type'"
          @click.stop="togglePlacingMode"
        >
          <component :is="iconFor(selectedNodeTypeObj?.icon ?? 'square')" :size="18" />
        </button>
        <button
          class="rounded-md p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          @click.stop="toggle('node')"
        >
          <ChevronUp :size="14" />
        </button>
      </div>

      <!-- Text placement tool -->
      <button
        class="rounded-md p-2 hover:bg-secondary-700 text-grey-200 transition-colors"
        title="Place text"
      >
        <Type :size="18" />
      </button>

      <!-- Edge tool section -->
      <div class="flex items-center">
        <div class="rounded-md p-2 text-grey-200">
          <component :is="activeEdgeIcon" :size="18" />
        </div>
        <button
          class="rounded-md p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          @click.stop="toggle('edge')"
        >
          <ChevronUp :size="14" />
        </button>
      </div>
    </div>

    <SketchToolbarDropdown
      v-if="activeDropdown === 'node'"
      :items="nodeDropdownItems"
      :selected-key="selectedNodeType"
      @select="selectNodeType"
    />

    <SketchToolbarDropdown
      v-if="activeDropdown === 'edge'"
      :items="edgeDropdownItems"
      :selected-key="activeEdgeTool"
      align-right
      @select="key => { setEdgeTool(key as EdgeToolId); activeDropdown = null }"
    />
  </Panel>
</template>
