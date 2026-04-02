import type { NodeType } from '~/types/NodeType'

export function useNodeTypes() {
  const { get } = useApi()
  const nodeTypes = useState<NodeType[]>('node-types', () => [])

  const fetchNodeTypes = async () => {
    if (nodeTypes.value.length > 0) return
    const types = await get<NodeType[]>('/api/node-types')
    if (types) nodeTypes.value = types
  }

  return { nodeTypes, fetchNodeTypes }
}
