<script setup lang="ts">
const { isCollapsed } = useSidebar()

defineProps<{
  fullHeight?: boolean
}>()
</script>

<template>

  <!-- Scherm te klein -->
  <div class="hidden max-lg:flex min-h-screen bg-[var(--color-secondary-950)] items-center justify-center p-8">
    <div class="flex flex-col items-center text-center max-w-sm border border-[var(--color-secondary-700)] rounded-xl p-10">
      <img src="/images/cbyte-logo.png" alt="CBYTE digital" class="h-10 mb-8" >
      <h1 class="font-heading text-h1 font-bold text-white mb-3">Scherm te klein</h1>
      <p class="text-[var(--color-grey-400)]">Deze applicatie is ontworpen voor grotere schermen. Gebruik een apparaat met een schermgrootte van minimaal 1024px.</p>
    </div>
  </div>

  <!-- Layout -->
  <div :class="['hidden lg:block', { 'lg:flex h-screen overflow-hidden': fullHeight }]">
    <DefaultSidebar />
    <main :class="['transition-all duration-300', isCollapsed ? 'ml-12' : 'ml-60', fullHeight ? 'flex-1 h-screen overflow-hidden' : 'p-5']">
      <slot />
    </main>
  </div>

</template>
