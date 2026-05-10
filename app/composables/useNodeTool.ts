export function useNodeTool() {
  const { activeTool } = useActiveTool()
  const selectedNodeType = useState<string | null>('selected-node-type', () => null)
  const isPlacingNode = useState<boolean>('is-placing-node', () => false)

  function setNodeType(type: string) {
    selectedNodeType.value = type
    isPlacingNode.value = true
    activeTool.value = 'node'
  }

  function stopPlacing() {
    isPlacingNode.value = false
    activeTool.value = 'pointer'
  }

  function clearNodeType() {
    selectedNodeType.value = null
    isPlacingNode.value = false
    activeTool.value = 'pointer'
  }

  return { selectedNodeType, isPlacingNode, setNodeType, stopPlacing, clearNodeType }
}
