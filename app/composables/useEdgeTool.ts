import { MarkerType } from '@vue-flow/core'

export type EdgeToolId = 'mono' | 'bi' | 'none'

export interface EdgeTool {
  id: EdgeToolId
  label: string
  icon: string
}

export const EDGE_TOOLS: EdgeTool[] = [
  { id: 'mono', label: 'Monodirectional', icon: 'arrow-right' },
  { id: 'bi', label: 'Bidirectional', icon: 'arrow-left-right' },
  { id: 'none', label: 'No direction', icon: 'minus' },
]

export function useEdgeTool() {
  const activeEdgeTool = useState<EdgeToolId>('edge-tool', () => 'mono')

  const defaultEdgeOptions = computed(() => {
    if (activeEdgeTool.value === 'mono') {
      return { type: 'smoothstep', markerEnd: { type: MarkerType.ArrowClosed } }
    }
    if (activeEdgeTool.value === 'bi') {
      return {
        type: 'smoothstep',
        markerStart: { type: MarkerType.ArrowClosed },
        markerEnd: { type: MarkerType.ArrowClosed },
      }
    }
    return { type: 'smoothstep' }
  })

  const setEdgeTool = (id: EdgeToolId) => { activeEdgeTool.value = id }

  return { activeEdgeTool, defaultEdgeOptions, setEdgeTool, EDGE_TOOLS }
}
