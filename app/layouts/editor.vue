<script setup lang="ts">
const { topbarState } = useSketchTopbar()
</script>

<template>
  <AppShell full-height>
    <div class="flex flex-col h-full">
      <SketchTopbar
        v-if="topbarState"
        :sketch-title="topbarState.sketchTitle"
        :back-to="topbarState.backTo"
        :sketch-id="topbarState.sketchId"
        :project-id="topbarState.projectId"
      />
      <div class="flex-1 overflow-hidden">
        <slot />
      </div>
    </div>
  </AppShell>
</template>
