<script setup lang="ts">
const { isCollapsed } = useSidebar()
</script>

<template>
  <AppShell full-height>
    <slot />
  </AppShell>
</template>
