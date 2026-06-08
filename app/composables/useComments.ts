import type { Comment } from '~/types/Comment'

const comments = ref<Comment[]>([])

export function useComments() {
  const { get, post, patch, del } = useApi()

  async function loadComments(sketchId: number) {
    const result = await get<Comment[]>(`/api/sketches/${sketchId}/comments`)
    comments.value = result ?? []
  }

  async function loadPublicComments(token: string) {
    const result = await get<Comment[]>(`/api/shared/${token}/comments`)
    comments.value = result ?? []
  }

  async function addComment(sketchId: number, x: number, y: number, body = ''): Promise<Comment | undefined> {
    const created = await post<Comment>(`/api/sketches/${sketchId}/comments`, { x, y, body })
    if (created) comments.value.push(created)
    return created
  }

  async function addPublicComment(
    token: string,
    x: number,
    y: number,
    guestName: string,
    body = '',
  ): Promise<Comment | undefined> {
    const created = await post<Comment>(`/api/shared/${token}/comments`, { x, y, body, guest_name: guestName })
    if (created) comments.value.push(created)
    return created
  }

  async function addReply(sketchId: number, parentId: number, body: string): Promise<Comment | undefined> {
    const parent = comments.value.find(c => c.id === parentId)
    if (!parent) return undefined
    const created = await post<Comment>(`/api/sketches/${sketchId}/comments`, {
      x: parent.x,
      y: parent.y,
      body,
      parent_id: parentId,
    })
    if (created) comments.value.push(created)
    return created
  }

  function getReplies(parentId: number): Comment[] {
    return comments.value
      .filter(c => c.parent_id === parentId)
      .sort((a, b) => a.created_at.localeCompare(b.created_at))
  }

  function resolveThread(parentId: number): Promise<void> {
    return deleteComment(parentId)
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
    const removed = comments.value.filter(c => c.id === id || c.parent_id === id)
    comments.value = comments.value.filter(c => c.id !== id && c.parent_id !== id)
    try {
      await del(`/api/comments/${id}`)
    } catch (error) {
      comments.value = [...comments.value, ...removed]
      throw error
    }
  }

  function clearComments() {
    comments.value = []
  }

  return {
    comments,
    loadComments,
    loadPublicComments,
    addComment,
    addPublicComment,
    addReply,
    getReplies,
    resolveThread,
    updateCommentPosition,
    updateCommentBody,
    deleteComment,
    clearComments,
  }
}
