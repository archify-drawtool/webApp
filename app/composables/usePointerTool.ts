export function usePointerTool() {
  const { activeTool } = useActiveTool()
  const { isPlacingNode } = useNodeTool()

  const isPointerToolActive = computed(() =>
    activeTool.value === 'pointer' || activeTool.value === 'node'
  )

  function activatePointerTool() {
    isPlacingNode.value = false
    activeTool.value = 'pointer'
  }

  return { isPointerToolActive, activatePointerTool }
}
