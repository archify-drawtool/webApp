<script setup lang="ts">
import { ArrowLeft, Download, ChevronDown, FileImage, GitBranch } from 'lucide-vue-next'

defineProps<{
  sketchTitle: string
  backTo: string
}>()

const dropdownOpen = ref(false)
</script>

<template>
  <div v-if="dropdownOpen" class="fixed inset-0 z-40" @mousedown="dropdownOpen = false" />

  <header class="relative flex items-center h-12 px-4 bg-secondary-950 border-b border-secondary-700 shrink-0 z-30">

    <NuxtLink
      :to="backTo"
      class="flex items-center gap-1.5 text-grey-200 hover:text-white transition-colors text-sm font-heading font-bold"
    >
      <ArrowLeft :size="16" />
      <span>Terug</span>
    </NuxtLink>

    <span class="absolute left-1/2 -translate-x-1/2 font-heading font-bold text-white text-base truncate max-w-xs pointer-events-none">
      {{ sketchTitle }}
    </span>

    <div class="ml-auto relative z-50">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-900 active:bg-primary-700 text-white font-heading font-bold text-sm transition-colors"
        @click="dropdownOpen = !dropdownOpen"
      >
        <Download :size="15" />
        <span>Exporteren</span>
        <ChevronDown :size="14" class="transition-transform" :class="{ 'rotate-180': dropdownOpen }" />
      </button>

      <div
        v-if="dropdownOpen"
        class="absolute top-full right-0 mt-1 bg-secondary-900 border border-secondary-700 rounded-lg p-1 min-w-36"
      >
        <button class="flex items-center gap-2 px-3 py-2 rounded-md w-full text-grey-100 hover:bg-secondary-700 transition-colors text-sm">
          <FileImage :size="15" />
          <span>PNG</span>
        </button>
        <button class="flex items-center gap-2 px-3 py-2 rounded-md w-full text-grey-100 hover:bg-secondary-700 transition-colors text-sm">
          <GitBranch :size="15" />
          <span>Mermaid</span>
        </button>
      </div>
    </div>

  </header>
</template>
