export function useNodeTool() {
  const pendingNodeType = useState<string | null>('pending-node-type', () => null)

  const activateNodeType = (type: string) => { pendingNodeType.value = type }
  const clearNodeType = () => { pendingNodeType.value = null }

  return { pendingNodeType, activateNodeType, clearNodeType }
}
