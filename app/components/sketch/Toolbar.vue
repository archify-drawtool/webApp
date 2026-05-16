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
  StickyNote,
  Type,
  Hand,
  MousePointer2,
  Grip,
  MessageCircle,
} from 'lucide-vue-next'

const { nodeTypes } = useNodeTypes()
const { activeEdgeTool, setEdgeTool, EDGE_TOOLS } = useEdgeTool()
type EdgeToolId = ReturnType<typeof useEdgeTool>['activeEdgeTool']['value']
const { selectedNodeType, isPlacingNode, setNodeType, stopPlacing } = useNodeTool()
const { isDragToolActive, activateDragTool } = useDragTool()
const { activatePointerTool } = usePointerTool()
const { isCommentToolActive, activateCommentTool } = useCommentTool()
const { showDots, toggleDots } = useDotsToggle()

type DropdownId = 'node' | 'edge' | 'tool'
const activeDropdown = ref<DropdownId | null>(null)
const anyOpen = computed(() => activeDropdown.value !== null)

const toolDropdownItems = [
  { key: 'drag', icon: Hand, label: 'Slepen' },
  { key: 'pointer', icon: MousePointer2, label: 'Pointer' },
]
const selectedToolKey = computed(() => (isDragToolActive.value ? 'drag' : 'pointer'))
const activeToolIcon = computed(() => (isDragToolActive.value ? Hand : MousePointer2))

function selectTool(key: string) {
  if (key === 'drag') activateDragTool()
  else activatePointerTool()
  activeDropdown.value = null
}

const iconComponents: Record<string, Component> = {
  server: Server,
  database: Database,
  'layout-dashboard': LayoutDashboard,
  user: User,
  square: Square,
  'sticky-note': StickyNote,
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
      setNodeType(selectedNodeType.value!)
    }
  }
}

const panelRef = ref<HTMLElement | null>(null)

function handleKeydown(e: KeyboardEvent) {
  const target = e.target as HTMLElement
  if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) return

  if (e.key === 'Escape') {
    if (isPlacingNode.value) stopPlacing()
    else if (isCommentToolActive.value) activatePointerTool()
    else closeAll()
  } else if (e.key === '1') {
    activateDragTool()
  } else if (e.key === '2') {
    activatePointerTool()
  }
}

function onDocumentMousedown(e: MouseEvent) {
  if (!anyOpen.value) return
  if (panelRef.value?.contains(e.target as Node)) return
  closeAll()
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
  document.addEventListener('mousedown', onDocumentMousedown, true)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
  document.removeEventListener('mousedown', onDocumentMousedown, true)
})
</script>

<template>
  <Panel position="bottom-center">
    <div ref="panelRef" class="relative">
    <div class="relative z-50 flex items-center gap-1 rounded-xl bg-secondary-900 shadow-lg px-3 py-2">

      <!-- Tool section (drag / pointer) -->
      <div class="flex items-center">
        <button
          :class="[
            'rounded-md p-2 transition-colors cursor-pointer',
            isPlacingNode || isCommentToolActive
              ? 'hover:bg-secondary-700 text-grey-200'
              : 'bg-primary-500 text-white',
          ]"
          title="Actief gereedschap"
          @click.stop="selectTool(selectedToolKey)"
        >
          <component :is="activeToolIcon" :size="18" />
        </button>
        <button
          class="rounded-md p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          title="Kies gereedschap"
          @click.stop="toggle('tool')"
        >
          <ChevronUp :size="14" />
        </button>
      </div>

      <div class="w-px h-5 bg-secondary-700 mx-1" />

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
          @click.stop="() => { closeAll(); togglePlacingMode() }"
        >
          <component :is="iconFor(selectedNodeTypeObj?.icon ?? 'square')" :size="18" />
        </button>
        <button
          class="rounded-md p-1 hover:bg-secondary-700 text-grey-400 transition-colors"
          title="Kies uit een nodetype"
          @click.stop="toggle('node')"
        >
          <ChevronUp :size="14" />
        </button>
      </div>

      <!-- Text placement tool -->
      <button
        class="rounded-md p-2 hover:bg-secondary-700 text-grey-200 transition-colors"
        title="Plaats tekst"
      >
        <Type :size="18" />
      </button>

      <!-- Comment placement tool -->
      <button
        :class="[
          'rounded-md p-2 transition-colors',
          isCommentToolActive
            ? 'bg-primary-500 text-white cursor-crosshair'
            : 'hover:bg-secondary-700 text-grey-200 cursor-pointer',
        ]"
        :title="isCommentToolActive ? 'Klik op het canvas om een comment te plaatsen (Escape om te annuleren)' : 'Plaats een comment'"
        @click.stop="() => { closeAll(); activateCommentTool() }"
      >
        <MessageCircle :size="18" />
      </button>

      <!-- Edge tool section -->
      <button
        :class="[
          'flex items-center rounded-md transition-colors cursor-pointer',
          activeDropdown === 'edge'
            ? 'bg-primary-500 text-white'
            : 'hover:bg-secondary-700 text-grey-200',
        ]"
        title="Kies uit een relatietype"
        @click.stop="toggle('edge')"
      >
        <span class="p-2">
          <component :is="activeEdgeIcon" :size="18" />
        </span>
        <span class="p-1" :class="activeDropdown === 'edge' ? 'text-white' : 'text-grey-400'">
          <ChevronUp :size="14" />
        </span>
      </button>

      <div class="w-px h-5 bg-secondary-700 mx-1" />

      <!-- Dots toggle -->
      <button
        :class="[
          'rounded-md p-2 transition-colors cursor-pointer',
          showDots
            ? 'bg-primary-500 text-white'
            : 'hover:bg-secondary-700 text-grey-200',
        ]"
        :title="showDots ? 'Verberg achtergrond stipjes' : 'Toon achtergrond stipjes'"
        @click.stop="() => { closeAll(); toggleDots() }"
      >
        <Grip :size="18" />
      </button>
    </div>

    <SketchToolbarDropdown
      v-if="activeDropdown === 'tool'"
      :items="toolDropdownItems"
      :selected-key="selectedToolKey"
      @select="selectTool"
    />

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
    </div>
  </Panel>
</template>
