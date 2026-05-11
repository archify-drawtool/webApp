interface EdgeContextMenuState {
  edgeId: string
  x: number
  y: number
  hasMarkerEnd: boolean
  hasMarkerStart: boolean
  isDashed: boolean
}

const state = ref<EdgeContextMenuState | null>(null)

export function useEdgeContextMenu() {
  function open(menu: EdgeContextMenuState) {
    state.value = menu
  }

  function close() {
    state.value = null
  }

  return { state, open, close }
}
