import { useVueFlow } from '@vue-flow/core'
import { SKETCH_CANVAS_ID } from '~/composables/useSketchCanvas'

const SHAPE_MAP: Record<string, string> = {
  rectangle: 'rectangle',
  server: 'subroutine',
  database: 'cylinder',
  application: 'hexagon',
  user: 'circle',
}

function sanitizeId(id: string): string {
  return id.replace(/[^a-zA-Z0-9_-]/g, '_')
}

function escapeLabel(label: string): string {
  return label.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function nodeToMermaid(node: { id: string; type?: string; data?: { label?: string } }): string {
  const id = sanitizeId(node.id)
  const label = escapeLabel(node.data?.label || node.id)
  const shape = SHAPE_MAP[node.type ?? 'rectangle'] ?? 'rectangle'

  switch (shape) {
    case 'subroutine': return `  ${id}[["${label}"]]`
    case 'cylinder':   return `  ${id}[("${label}")]`
    case 'hexagon':    return `  ${id}{{"${label}"}}`
    case 'circle':     return `  ${id}(("${label}"))`
    default:           return `  ${id}["${label}"]`
  }
}

function edgeToMermaid(edge: {
  source: string
  target: string
  label?: unknown
  markerStart?: unknown
  markerEnd?: unknown
}): string {
  const source = sanitizeId(edge.source)
  const target = sanitizeId(edge.target)
  const hasStart = !!(edge.markerStart && (edge.markerStart as { type?: string }).type)
  const hasEnd = !!(edge.markerEnd && (edge.markerEnd as { type?: string }).type)

  let arrow: string
  if (hasStart && hasEnd) arrow = '<-->'
  else if (hasEnd) arrow = '-->'
  else arrow = '---'

  const label = typeof edge.label === 'string' && edge.label.trim() ? edge.label.trim() : null
  if (label) {
    return `  ${source} ${arrow}|"${escapeLabel(label)}"| ${target}`
  }
  return `  ${source} ${arrow} ${target}`
}

export function useMermaidExport() {
  const { getNodes, getEdges } = useVueFlow(SKETCH_CANVAS_ID)

  function exportAsMermaid(sketchTitle: string): void {
    const lines = ['flowchart TD']
    for (const node of getNodes.value) {
      if (!node.id) continue
      lines.push(nodeToMermaid(node))
    }
    for (const edge of getEdges.value) {
      if (!edge.source || !edge.target) continue
      lines.push(edgeToMermaid(edge))
    }

    const content = lines.join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${sketchTitle || 'schets'}.mmd`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  }

  return { exportAsMermaid }
}
