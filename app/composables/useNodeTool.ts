export function useNodeTool() {
  const selectedNodeType = useState<string | null>('selected-node-type', () => null)
  const isPlacingNode = useState<boolean>('is-placing-node', () => false)

  function setNodeType(type: string) {
    selectedNodeType.value = type
    isPlacingNode.value = true
  }

  function clearNodeType() {
    selectedNodeType.value = null
    isPlacingNode.value = false
  }

  return { selectedNodeType, isPlacingNode, setNodeType, clearNodeType }
}
