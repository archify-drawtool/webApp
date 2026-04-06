export function useNodeTool() {
  const pendingNodeType = useState<string | null>('pending-node-type', () => null)
  const lastNodeType = useState<string | null>('last-node-type', () => null)

  const activateNodeType = (type: string) => {
    lastNodeType.value = type
    pendingNodeType.value = type
  }
  const clearNodeType = () => { pendingNodeType.value = null }

  return { pendingNodeType, lastNodeType, activateNodeType, clearNodeType }
}
