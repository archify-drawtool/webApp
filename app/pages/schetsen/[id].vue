<script setup lang="ts">
import type { Sketch } from '~/types/Sketch'

definePageMeta({
  layout: 'editor',
  alias: ['/projecten/:projectId/schetsen/:id'],
})

const route = useRoute()
const { fetchSketch, clearCanvas, watchAndSave } = useSketchCanvas()
const { setTopbar, clearTopbar } = useSketchTopbar()

const loading = ref(true)
const error = ref<string | null>(null)
const sketch = ref<Sketch | null>(null)

async function load(id: string, projectId: string | undefined) {
  loading.value = true
  error.value = null
  try {
const result = await fetchSketch(id, projectId)
    if (result) {
      sketch.value = result
      watchAndSave(result.id, result.project_id)

      const resolvedProjectId = projectId ?? result.project_id
      setTopbar({
        sketchTitle: result.title,
        backTo: `/projecten/${resolvedProjectId}`,
        sketchId: result.id,
        projectId: result.project_id,
      })
    }
  } catch (e) {
    const err = e as { statusMessage?: string; message?: string }
    error.value = err?.statusMessage ?? err?.message ?? 'Schets kon niet worden geladen.'
    clearCanvas()
  } finally {
    loading.value = false
  }
}

onBeforeRouteLeave(() => {
  clearCanvas()
  clearTopbar()
})

onBeforeRouteUpdate((to, from) => {
  if (
    to.params.id === from.params.id
    && to.params.projectId === from.params.projectId
  ) return
  clearCanvas()
  void load(to.params.id as string, to.params.projectId as string | undefined)
})

onMounted(() => {
  void load(
    route.params.id as string,
    route.params.projectId as string | undefined,
  )
})
</script>

<template>
  <div class="relative h-full w-full">
    <SketchCanvas />
    <div v-if="loading || error" class="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-[var(--color-secondary-950)]">
      <span v-if="loading" class="text-grey-400">Schets laden...</span>
      <template v-else-if="error">
        <p class="text-[var(--color-error-text)] text-base text-center px-8">{{ error }}</p>
        <NuxtLink
          v-if="route.params.projectId"
          :to="`/projecten/${route.params.projectId}`"
          class="text-white text-h3 font-heading underline"
        >
          Terug naar project
        </NuxtLink>
      </template>
    </div>
  </div>
</template>
