import type { Node, Edge } from '@vue-flow/core'

export interface Sketch {
  id: number;
  title: string;
  project_id: number;
  canvas_state: {
    nodes: Node[];
    edges: Edge[];
  } | null;
  created_at: string;
  updated_at: string;
}
