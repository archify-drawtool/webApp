import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

export function useDeleteNode() {
  const {
    getSelectedNodes,
    getSelectedEdges,
    removeNodes,
    getEdges,
    removeEdges,
  } = useVueFlow(SKETCH_CANVAS_ID)
  const { undo, redo } = useSketchCanvas()
  const { snapshot } = useSketchHistory()
  const { copy, paste } = useCopyPaste()

  function deleteSelection() {
    const selectedNodes = getSelectedNodes.value
    const selectedEdges = getSelectedEdges.value
    if (!selectedNodes.length && !selectedEdges.length) return

    snapshot()

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id))

    const edgeIdsToRemove = new Set<string>(selectedEdges.map(e => e.id))
    for (const e of getEdges.value) {
      if (selectedNodeIds.has(e.source) || selectedNodeIds.has(e.target)) {
        edgeIdsToRemove.add(e.id)
      }
    }

    if (edgeIdsToRemove.size) {
      removeEdges([...edgeIdsToRemove])
    }

    if (selectedNodeIds.size) {
      removeNodes([...selectedNodeIds])
    }
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

    if (modifier && key === 'c') {
      event.preventDefault()
      copy()
      return
    }

    if (modifier && key === 'v') {
      event.preventDefault()
      paste()
      return
    }

    if (event.key === 'Delete' || event.key === 'Backspace') {
      deleteSelection()
    }
  }

  function mount() {
    window.addEventListener('keydown', onKeyDown)
  }

  function unmount() {
    window.removeEventListener('keydown', onKeyDown)
  }

  return { deleteSelection, mount, unmount }
}
