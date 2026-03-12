<script setup lang="ts">
</script>
<template>

  <div class="hidden max-lg:flex min-h-screen bg-[var(--color-secondary-950)] items-center justify-center p-8">
    <div class="flex flex-col items-center text-center max-w-sm  border-[var(--color-secondary-700)] rounded-xl">
      <img src="/images/cbyte-logo.png" alt="CBYTE digital" class="h-10 mb-8" />
      <h1 class="font-heading text-h1 font-bold text-white mb-3">Scherm te klein</h1>
      <p class="text-[var(--color-grey-400)]">Deze applicatie is ontworpen voor grotere schermen. Gebruik een apparaat met een schermgrootte van minimaal 1024px.</p>
    </div>
  </div>

  <div class="app-layout flex">
    <DefaultSidebar />
    <main class="flex-1 p-5">
      <slot />
    </main>
  </div>
</template>

<style scoped>
@media (max-width: 1024px) {
  .mobile-message {
    display: flex;
  }

  .app-layout {
    display: none;
  }
}
</style>