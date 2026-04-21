export function useDragTool() {
  const { isPlacingNode, stopPlacing } = useNodeTool()

  const isDragToolActive = computed(() => !isPlacingNode.value)

  function activateDragTool() {
    stopPlacing()
  }

  return { isDragToolActive, activateDragTool }
}
