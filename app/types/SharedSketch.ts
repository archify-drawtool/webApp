import type { Node, Edge } from '@vue-flow/core'

export interface SharedSketch {
  title: string
  project_title: string
  canvas_state: { nodes: Node[]; edges: Edge[] } | null
}

export interface SketchShareState {
  is_active: boolean
  token: string | null
  public_url: string | null
}
