export function useDragTool() {
  const { activeTool } = useActiveTool()
  const { stopPlacing } = useNodeTool()

  const isDragToolActive = computed(() => activeTool.value === 'drag')

  function activateDragTool() {
    stopPlacing()
  }

  return { isDragToolActive, activateDragTool }
}
