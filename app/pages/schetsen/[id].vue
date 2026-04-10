<script setup lang="ts">
definePageMeta({
  layout: 'editor',
  alias: ['/projecten/:projectId/schetsen/:id'],
})

const route = useRoute()
const { fetchSketch, clearCanvas, watchAndSave } = useSketchCanvas()
const loading = ref(true)
const error = ref(false)

onUnmounted(clearCanvas)

onMounted(async () => {
  try {
    const sketch = await fetchSketch(
      route.params.id as string,
      route.params.projectId as string | undefined,
    )
    if (sketch) {
      watchAndSave(sketch.id, sketch.project_id)
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
    <div v-if="loading || error" class="absolute inset-0 flex items-center justify-center bg-[var(--color-secondary-950)]">
      <span class="text-grey-400">{{ error ? 'Schets kon niet worden geladen.' : 'Schets laden...' }}</span>
    </div>
  </div>
</template>
