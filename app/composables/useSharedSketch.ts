import type { SharedSketch } from '~/types/SharedSketch'

export function useSharedSketch() {
  const config = useRuntimeConfig()

  const fetchShared = async (token: string): Promise<SharedSketch | null> => {
    try {
      return await $fetch<SharedSketch>(
        `${config.public.apiBaseUrl}/api/shared/${token}`,
        { headers: { Accept: 'application/json' } },
      )
    } catch (err: unknown) {
      if ((err as { status?: number })?.status === 404) return null
      throw err
    }
  }

  return { fetchShared }
}
