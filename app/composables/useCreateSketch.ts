import type { SketchSummary } from '~/types/SketchSummary'

export function useCreateSketch() {
  const { post } = useApi()
  const creating = ref(false)
  const createError = ref<string | null>(null)

  async function createSketch() {
    creating.value = true
    createError.value = null
    try {
      const sketch = await post<SketchSummary>('/api/sketches', {})
      if (sketch) {
        await navigateTo(`/schetsen/${sketch.id}`)
      }
    } catch (e) {
      const err = e as { statusMessage?: string }
      createError.value = err?.statusMessage ?? 'Aanmaken mislukt. Probeer het opnieuw.'
    } finally {
      creating.value = false
    }
  }

  return { creating, createError, createSketch }
}
