import { useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const MAX_HISTORY = 50

interface Snapshot {
  nodes: Node[]
  edges: Edge[]
}

const past = ref<Snapshot[]>([])
const future = ref<Snapshot[]>([])

export function useSketchHistory() {
  const { toObject, setNodes, setEdges } = useVueFlow(SKETCH_CANVAS_ID)

  const canUndo = computed(() => past.value.length > 0)
  const canRedo = computed(() => future.value.length > 0)

  function capture(): Snapshot {
    const { nodes, edges } = toObject()
    return { nodes, edges }
  }

  function snapshot() {
    past.value = [...past.value.slice(-MAX_HISTORY + 1), capture()]
    future.value = []
  }

  function undo() {
    if (!canUndo.value) return

    const previous = past.value[past.value.length - 1]
    past.value = past.value.slice(0, -1)
    future.value = [capture(), ...future.value]

    setNodes(previous.nodes)
    setEdges(previous.edges)
  }

  function redo() {
    if (!canRedo.value) return

    const next = future.value[0]
    future.value = future.value.slice(1)
    past.value = [...past.value, capture()]

    setNodes(next.nodes)
    setEdges(next.edges)
  }

  function clearHistory() {
    past.value = []
    future.value = []
  }

  return { snapshot, undo, redo, clearHistory, canUndo, canRedo }
}
