export interface CommentAuthor {
  id: number
  name: string
  email: string
}

export interface Comment {
  id: number
  sketch_id: number
  user_id: number | null
  guest_name: string | null
  parent_id: number | null
  x: number
  y: number
  body: string
  created_at: string
  updated_at: string
  author?: CommentAuthor
}
