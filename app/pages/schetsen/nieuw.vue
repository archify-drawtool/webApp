<script setup lang="ts">
definePageMeta({
  layout: 'editor',
})

const { clearCanvas } = useSketchCanvas()

onMounted(clearCanvas)
onBeforeRouteLeave(clearCanvas)
</script>

<template>
  <SketchCanvas />
</template>
