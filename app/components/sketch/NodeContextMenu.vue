<script setup lang="ts">
import { resolveIcon } from '~/utils/lucideIcon'

const { menuState, closeMenu } = useNodeContextMenu()
const { nodeTypes } = useNodeTypes()
const { changeNodeTypeWithHistory } = useSketchCanvas()

const nodeDropdownItems = computed(() =>
  nodeTypes.value.map(nt => ({ key: nt.type, icon: resolveIcon(nt.icon), label: nt.name })),
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
      <div class="fixed inset-0 z-90" @mousedown="closeMenu" />
      <div
        class="fixed z-91 top-[var(--menu-top)] left-[var(--menu-left)]"
        :style="{ '--menu-top': `${menuState.y}px`, '--menu-left': `${menuState.x}px` }"
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

