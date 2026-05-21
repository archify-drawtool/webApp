export function useDragTool() {
  const { activeTool } = useActiveTool()
  const { isPlacingNode } = useNodeTool()

  const isDragToolActive = computed(() => activeTool.value === 'drag')

  function activateDragTool() {
    isPlacingNode.value = false
    activeTool.value = 'drag'
  }

  return { isDragToolActive, activateDragTool }
}
