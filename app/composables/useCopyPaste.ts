import { useVueFlow, type Node, type Edge } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const PASTE_OFFSET = 20

interface ClipboardNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: Record<string, unknown>
}

interface ClipboardEdge {
  id: string
  source: string
  target: string
  sourceHandle?: string | null
  targetHandle?: string | null
  type?: string
  label?: string | unknown
  markerEnd?: unknown
  markerStart?: unknown
}

interface ClipboardState {
  nodes: ClipboardNode[]
  edges: ClipboardEdge[]
}

const clipboard = ref<ClipboardState | null>(null)

export function useCopyPaste() {
  const {
    getSelectedNodes,
    getEdges,
    addNodes,
    addEdges,
    updateNode,
    getNodes,
  } = useVueFlow(SKETCH_CANVAS_ID)

  const { snapshot } = useSketchHistory()

  function copy() {
    const selectedNodes = getSelectedNodes.value
    if (!selectedNodes.length) return

    const selectedNodeIds = new Set(selectedNodes.map(n => n.id))

    // Sla alleen de plain-data velden op (geen markRaw velden zoals dimensions/computedPosition/events)
    const clippedNodes: ClipboardNode[] = selectedNodes.map(n => ({
      id: n.id,
      type: n.type,
      position: { x: n.position.x, y: n.position.y },
      data: JSON.parse(JSON.stringify(n.data ?? {})),
    }))

    // Kopieer alleen edges waarvan zowel source als target in de selectie zitten
    const clippedEdges: ClipboardEdge[] = getEdges.value
      .filter(e => selectedNodeIds.has(e.source) && selectedNodeIds.has(e.target))
      .map(e => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type,
        label: e.label,
        markerEnd: e.markerEnd,
        markerStart: e.markerStart,
      }))

    clipboard.value = { nodes: clippedNodes, edges: clippedEdges }
  }

  function paste() {
    if (!clipboard.value || !clipboard.value.nodes.length) return

    snapshot()

    // Mapping van oud ID -> nieuw ID
    const idMap = new Map<string, string>()
    clipboard.value.nodes.forEach(n => idMap.set(n.id, crypto.randomUUID()))

    // Nieuwe nodes met nieuwe IDs, offset positie, en selected=true
    const newNodes: Node[] = clipboard.value.nodes.map(n => ({
      id: idMap.get(n.id)!,
      type: n.type,
      position: {
        x: n.position.x + PASTE_OFFSET,
        y: n.position.y + PASTE_OFFSET,
      },
      data: JSON.parse(JSON.stringify(n.data ?? {})),
      selected: true,
    }))

    // Nieuwe edges met nieuwe IDs en vertaalde source/target
    const newEdges: Edge[] = clipboard.value.edges.map(e => {
      const edge: Edge = {
        id: crypto.randomUUID(),
        source: idMap.get(e.source)!,
        target: idMap.get(e.target)!,
        sourceHandle: e.sourceHandle ?? undefined,
        targetHandle: e.targetHandle ?? undefined,
        type: e.type ?? 'smoothstep',
      }
      if (e.label !== undefined && e.label !== '') edge.label = e.label as string
      if (e.markerEnd) edge.markerEnd = e.markerEnd as Edge['markerEnd']
      if (e.markerStart) edge.markerStart = e.markerStart as Edge['markerStart']
      return edge
    })

    // Deselecteer alle bestaande nodes via updateNode
    for (const node of getNodes.value) {
      if (node.selected) {
        updateNode(node.id, { selected: false })
      }
    }

    // Voeg de nieuwe nodes en edges toe
    addNodes(newNodes)
    if (newEdges.length) {
      addEdges(newEdges)
    }
  }

  return { copy, paste, clipboard }
}
