<script setup lang="ts">
const publicMeta = useState<{ title: string; projectTitle: string } | null>('public-page-meta', () => null)
</script>

<template>

  <!-- Scherm te klein -->
  <div class="hidden max-lg:flex min-h-screen bg-secondary-950 items-center justify-center p-8">
    <div class="flex flex-col items-center text-center max-w-sm border border-secondary-700 rounded-xl p-10">
      <img src="/images/cbyte-logo.png" alt="CBYTE digital" class="h-10 mb-8">
      <h1 class="font-heading text-h1 font-bold text-white mb-3">Scherm te klein</h1>
      <p class="text-grey-400">Deze applicatie is ontworpen voor grotere schermen. Gebruik een apparaat met een schermgrootte van minimaal 1024px.</p>
    </div>
  </div>

  <!-- Layout -->
  <div class="hidden lg:flex flex-col h-screen overflow-hidden bg-secondary-950">
    <header class="relative flex items-center h-12 px-4 bg-secondary-950 border-b border-secondary-700 shrink-0 z-50">
      <img src="/images/cbyte-logo.png" alt="CBYTE digital" class="h-6">
      <div v-if="publicMeta" class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
        <span class="font-heading font-bold text-white text-base truncate max-w-xs">{{ publicMeta.title }}</span>
        <span class="text-grey-400 text-xs truncate max-w-xs">{{ publicMeta.projectTitle }}</span>
      </div>
    </header>
    <div class="flex-1 overflow-hidden">
      <slot />
    </div>
  </div>

</template>
