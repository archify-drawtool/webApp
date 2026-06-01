export function useCommentTool() {
  const { activeTool } = useActiveTool()
  const { isPlacingNode } = useNodeTool()

  const isCommentToolActive = computed(() => activeTool.value === 'comment')

  function activateCommentTool() {
    isPlacingNode.value = false
    activeTool.value = 'comment'
  }

  return { isCommentToolActive, activateCommentTool }
}
