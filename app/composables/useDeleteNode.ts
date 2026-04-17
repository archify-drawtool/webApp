import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

export function useDeleteNode() {
  const { getSelectedNodes, removeNodes, getEdges, removeEdges } = useVueFlow(SKETCH_CANVAS_ID)

  function deleteSelectedNodes() {
    const selected = getSelectedNodes.value
    if (!selected.length) return

    const selectedIds = new Set(selected.map(n => n.id))

    const connectedEdgeIds = getEdges.value
      .filter(e => selectedIds.has(e.source) || selectedIds.has(e.target))
      .map(e => e.id)

    if (connectedEdgeIds.length) {
      removeEdges(connectedEdgeIds)
    }

    removeNodes(selected.map(n => n.id))
  }

  function onKeyDown(event: KeyboardEvent) {
    const tag = (event.target as HTMLElement)?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return

    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelectedNodes()
    }
  }

  function mount() {
    window.addEventListener('keydown', onKeyDown)
  }

  function unmount() {
    window.removeEventListener('keydown', onKeyDown)
  }

  return { deleteSelectedNodes, mount, unmount }
}
