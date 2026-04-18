import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

export function useDeleteNode() {
  const { getSelectedNodes, removeNodes, getEdges, removeEdges } = useVueFlow(SKETCH_CANVAS_ID)
  const { undo, redo } = useSketchCanvas()
  const { snapshot } = useSketchHistory()

  function deleteSelectedNodes() {
    const selected = getSelectedNodes.value
    if (!selected.length) return

    snapshot()

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
    const target = event.target as HTMLElement | null
    const tag = target?.tagName
    if (tag === 'INPUT' || tag === 'TEXTAREA') return
    if (target?.isContentEditable) return

    const isMac = navigator.platform.toUpperCase().includes('MAC')
    const modifier = isMac ? event.metaKey : event.ctrlKey
    const key = event.key.toLowerCase()

    if (modifier && !event.shiftKey && key === 'z') {
      event.preventDefault()
      undo()
      return
    }

    if (modifier && (key === 'y' || (event.shiftKey && key === 'z'))) {
      event.preventDefault()
      redo()
      return
    }

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
