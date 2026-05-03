interface PublicNodeType {
  type: string
  icon: string
}

export function usePublicNodeTypes() {
  const config = useRuntimeConfig()
  const nodeTypes = useState<PublicNodeType[]>('public-node-types', () => [])

  const fetchNodeTypes = async () => {
    if (nodeTypes.value.length > 0) return
    const types = await $fetch<PublicNodeType[]>(
      `${config.public.apiBaseUrl}/api/shared/node-types`,
      { headers: { Accept: 'application/json' } },
    )
    if (types) nodeTypes.value = types
  }

  return { nodeTypes, fetchNodeTypes }
}
