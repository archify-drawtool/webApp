interface PublicNodeType {
  type: string
  icon: string
}

export function usePublicNodeTypes() {
  const { get } = useApi()
  const nodeTypes = useState<PublicNodeType[]>('public-node-types', () => [])

  const fetchNodeTypes = async () => {
    if (nodeTypes.value.length > 0) return
    const types = await get<PublicNodeType[]>('/api/shared/node-types')
    if (types) nodeTypes.value = types
  }

  return { nodeTypes, fetchNodeTypes }
}
