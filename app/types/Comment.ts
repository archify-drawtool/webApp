export interface Comment {
  id: number
  sketch_id: number
  user_id: number
  parent_id: number | null
  x: number
  y: number
  body: string
  created_at: string
  updated_at: string
}
