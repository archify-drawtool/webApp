import type { SharedSketch } from '~/types/SharedSketch'

export function useSharedSketch() {
  const { get } = useApi()

  const fetchShared = async (token: string): Promise<SharedSketch | null> => {
    try {
      return await get<SharedSketch>(`/api/shared/${token}`) ?? null
    } catch (err: unknown) {
      if ((err as { statusCode?: number })?.statusCode === 404) return null
      throw err
    }
  }

  return { fetchShared }
}
