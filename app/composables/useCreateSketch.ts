import type { SketchSummary } from '~/types/SketchSummary'

export function useCreateSketch() {
  const { post } = useApi()
  const creating = ref(false)
  const createError = ref<string | null>(null)

  function defaultTitle(): string {
    const now = new Date()
    const date = now.toLocaleDateString('nl-NL', { day: '2-digit', month: '2-digit' })
    const time = now.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', hour12: false })
    return `Nieuwe schets ${date} ${time}`
  }

  async function createSketch() {
    creating.value = true
    createError.value = null
    try {
      const sketch = await post<SketchSummary>('/api/sketches', { title: defaultTitle() })
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
