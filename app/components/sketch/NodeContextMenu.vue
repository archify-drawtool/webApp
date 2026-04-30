<script setup lang="ts">
import {
  Server,
  Database,
  LayoutDashboard,
  User,
  Square,
  StickyNote,
} from 'lucide-vue-next'

const { menuState, closeMenu } = useNodeContextMenu()
const { nodeTypes } = useNodeTypes()
const { changeNodeTypeWithHistory } = useSketchCanvas()

const iconComponents: Record<string, Component> = {
  server: Server,
  database: Database,
  'layout-dashboard': LayoutDashboard,
  user: User,
  square: Square,
  'sticky-note': StickyNote,
}

function iconFor(name: string): Component {
  return iconComponents[name] ?? Square
}

const nodeDropdownItems = computed(() =>
  nodeTypes.value.map(nt => ({ key: nt.type, icon: iconFor(nt.icon), label: nt.name })),
)

function onSelect(key: string) {
  if (menuState.value) {
    changeNodeTypeWithHistory(menuState.value.nodeId, key)
  }
  closeMenu()
}

function handleKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuState.value) {
    closeMenu()
  }
}

onMounted(() => window.addEventListener('keydown', handleKeydown))
onUnmounted(() => window.removeEventListener('keydown', handleKeydown))
</script>

<template>
  <Teleport to="body">
    <template v-if="menuState">
      <div class="fixed inset-0 z-[90]" @mousedown="closeMenu" />
      <div
        class="fixed z-[91]"
        :style="{ top: menuState.y + 'px', left: menuState.x + 'px' }"
      >
        <SketchToolbarDropdown
          :items="nodeDropdownItems"
          :selected-key="menuState.nodeType"
          position-class=""
          @select="onSelect"
        />
      </div>
    </template>
  </Teleport>
</template>
