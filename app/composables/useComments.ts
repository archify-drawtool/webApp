import type { Comment } from '~/types/Comment'

const comments = ref<Comment[]>([])

export function useComments() {
  const { get, post, patch, del } = useApi()

  async function loadComments(sketchId: number) {
    const result = await get<Comment[]>(`/api/sketches/${sketchId}/comments`)
    comments.value = result ?? []
  }

  async function addComment(sketchId: number, x: number, y: number, body = ''): Promise<Comment | undefined> {
    const created = await post<Comment>(`/api/sketches/${sketchId}/comments`, { x, y, body })
    if (created) comments.value.push(created)
    return created
  }

  async function updateCommentPosition(id: number, x: number, y: number) {
    const local = comments.value.find(c => c.id === id)
    if (local) {
      local.x = x
      local.y = y
    }
    await patch<Comment>(`/api/comments/${id}`, { x, y })
  }

  async function updateCommentBody(id: number, body: string) {
    const local = comments.value.find(c => c.id === id)
    if (local) local.body = body
    await patch<Comment>(`/api/comments/${id}`, { body })
  }

  async function deleteComment(id: number) {
    comments.value = comments.value.filter(c => c.id !== id && c.parent_id !== id)
    await del(`/api/comments/${id}`)
  }

  function clearComments() {
    comments.value = []
  }

  return {
    comments,
    loadComments,
    addComment,
    updateCommentPosition,
    updateCommentBody,
    deleteComment,
    clearComments,
  }
}
