interface NodeContextMenuState {
  nodeId: string
  nodeType: string
  x: number
  y: number
}

const menuState = ref<NodeContextMenuState | null>(null)

export function useNodeContextMenu() {
  function openMenu(nodeId: string, nodeType: string, x: number, y: number) {
    menuState.value = { nodeId, nodeType, x, y }
  }

  function closeMenu() {
    menuState.value = null
  }

  return { menuState, openMenu, closeMenu }
}
