<script setup lang="ts">
definePageMeta({
  layout: 'editor',
})

const route = useRoute()
const { fetchSketch, clearCanvas } = useSketchCanvas()
const { fetchNodeTypes } = useNodeTypes()
const loading = ref(true)
const error = ref(false)

onUnmounted(clearCanvas)

onMounted(async () => {
  try {
    await Promise.all([
      fetchSketch(route.params.id as string),
      fetchNodeTypes(),
    ])
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
