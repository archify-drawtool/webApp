import { MarkerType } from '@vue-flow/core'

export type EdgeToolId = 'mono' | 'bi' | 'none'

export interface EdgeTool {
  id: EdgeToolId
  label: string
  icon: string
}

export const EDGE_TOOLS: EdgeTool[] = [
  { id: 'none', label: 'Lijn', icon: 'minus' },
  { id: 'mono', label: 'Eenrichtingspijl', icon: 'arrow-right' },
  { id: 'bi', label: 'Tweerichtingspijl', icon: 'arrow-left-right' },
]

export function useEdgeTool() {
  const activeEdgeTool = useState<EdgeToolId>('edge-tool', () => 'none')

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
