<script setup lang="ts">
defineProps<{
  loading?: boolean;
  error?: string | null;
  isEmpty?: boolean;
  emptyTitle?: string;
  emptyMessage?: string;
  cols?: {
    sm?: number;
    lg?: number;
    xl?: number;
  };
}>();
</script>

<template>
  <div>
    <!-- Loading state -->
    <div
        v-if="loading"
        class="grid gap-4"
        :class="[
        'grid-cols-1',
        cols?.sm === 2 ? 'sm:grid-cols-2' : cols?.sm === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        cols?.lg === 2 ? 'lg:grid-cols-2' : cols?.lg === 3 ? 'lg:grid-cols-3' : cols?.lg === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        cols?.xl === 2 ? 'xl:grid-cols-2' : cols?.xl === 3 ? 'xl:grid-cols-3' : cols?.xl === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-4',
      ]"
    >
      <div
          v-for="n in 8"
          :key="n"
          class="bg-grey-100 rounded-lg h-28 animate-pulse"
      />
    </div>

    <!-- Error state -->
    <div v-else-if="error" class="text-error-text bg-error-bg rounded-lg p-4">
      {{ error }}
    </div>

    <!-- Empty state -->
    <div v-else-if="isEmpty" class="text-center py-16 text-grey-600">
      <p class="text-h2 font-heading mb-2">{{ emptyTitle ?? 'Geen resultaten gevonden' }}</p>
      <p class="text-small">{{ emptyMessage ?? 'Er is nog niets om te tonen.' }}</p>
    </div>

    <!-- Grid -->
    <div
        v-else
        class="grid gap-4"
        :class="[
        'grid-cols-1',
        cols?.sm === 2 ? 'sm:grid-cols-2' : cols?.sm === 3 ? 'sm:grid-cols-3' : 'sm:grid-cols-2',
        cols?.lg === 2 ? 'lg:grid-cols-2' : cols?.lg === 3 ? 'lg:grid-cols-3' : cols?.lg === 4 ? 'lg:grid-cols-4' : 'lg:grid-cols-3',
        cols?.xl === 2 ? 'xl:grid-cols-2' : cols?.xl === 3 ? 'xl:grid-cols-3' : cols?.xl === 4 ? 'xl:grid-cols-4' : 'xl:grid-cols-4',
      ]"
    >
      <slot />
    </div>
  </div>
</template>