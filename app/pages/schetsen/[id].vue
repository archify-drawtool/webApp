<script setup lang="ts">
import type { Sketch } from '~/types/Sketch'

definePageMeta({
  layout: 'editor',
  alias: ['/projecten/:projectId/schetsen/:id'],
})

const route = useRoute()
const { fetchSketch, clearCanvas, watchAndSave } = useSketchCanvas()
const loading = ref(true)
const error = ref(false)
const sketch = ref<Sketch | null>(null)

onUnmounted(clearCanvas)

onMounted(async () => {
  try {
    const result = await fetchSketch(
      route.params.id as string,
      route.params.projectId as string | undefined,
    )
    if (result) {
      sketch.value = result
      watchAndSave(result.id, result.project_id)
    }
  } catch {
    error.value = true
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div class="relative h-full w-full">
    <SketchCanvas />

    <SketchExportButton
      v-if="sketch && !loading && !error"
      :sketch-id="sketch.id"
      :project-id="sketch.project_id"
      :title="sketch.title"
      class="absolute top-4 right-4 z-10"
    />

    <div v-if="loading || error" class="absolute inset-0 flex items-center justify-center bg-[var(--color-secondary-950)]">
      <span class="text-grey-400">{{ error ? 'Schets kon niet worden geladen.' : 'Schets laden...' }}</span>
    </div>
  </div>
</template>
