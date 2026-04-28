export function useNodeTool() {
  const selectedNodeType = useState<string | null>('selected-node-type', () => null)
  const isPlacingNode = useState<boolean>('is-placing-node', () => false)

  function setNodeType(type: string) {
    selectedNodeType.value = type
    isPlacingNode.value = true
  }

  function stopPlacing() {
    isPlacingNode.value = false
  }

  function clearNodeType() {
    selectedNodeType.value = null
    isPlacingNode.value = false
  }

  return { selectedNodeType, isPlacingNode, setNodeType, stopPlacing, clearNodeType }
}
