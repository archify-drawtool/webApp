export function useNodeTool() {
  const selectedNodeType = useState<string | null>('selected-node-type', () => null)

  const setNodeType = (type: string) => { selectedNodeType.value = type }

  return { selectedNodeType, setNodeType }
}
