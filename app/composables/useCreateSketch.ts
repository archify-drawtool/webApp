import type { SketchSummary } from '~/types/SketchSummary'

export function useCreateSketch() {
  const { post } = useApi()
  const creating = ref(false)
  const createError = ref<string | null>(null)

  function generateSketchTitle(): string {
  const maanden = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december',
  ];
  const now = new Date();
  const dag = now.getDate();
  const maand = maanden[now.getMonth()];
  const uur = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `Schets ${dag} ${maand} ${uur}:${min}`;
  }

  async function createSketch(projectId?: number) {
    creating.value = true
    createError.value = null
    try {
      const sketch = await post<SketchSummary>('/api/sketches', { title: generateSketchTitle(), project_id: projectId })
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
