<script setup lang="ts">
definePageMeta({
  layout: 'editor',
})

const { clearCanvas } = useSketchCanvas()
const { setTopbar, clearTopbar } = useSketchTopbar()

onMounted(() => {
  clearCanvas()
  setTopbar({
    sketchTitle: 'Nieuwe schets',
    backTo: '/mijn-schetsen',
  })
})

onBeforeRouteLeave(() => {
  clearCanvas()
  clearTopbar()
})
</script>

<template>
  <SketchCanvas />
</template>
