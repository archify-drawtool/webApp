<script setup lang="ts">
import { X } from 'lucide-vue-next'

defineProps<{
  src: string | null
  loading?: boolean
  error?: string | null
}>()

const emit = defineEmits<{ close: [] }>()

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') emit('close')
}

onMounted(() => window.addEventListener('keydown', onKeydown))
onUnmounted(() => window.removeEventListener('keydown', onKeydown))
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
      @click.self="emit('close')"
    >
      <button
        type="button"
        class="absolute top-4 right-4 text-white hover:text-primary-300 transition-colors"
        aria-label="Sluiten"
        @click="emit('close')"
      >
        <X :size="28" />
      </button>

      <div class="max-w-full max-h-full flex items-center justify-center">
        <span v-if="loading" class="text-grey-200 text-sm">Foto laden...</span>
        <p v-else-if="error" class="text-error-text text-sm px-6 text-center">{{ error }}</p>
        <img
          v-else-if="src"
          :src="src"
          alt="Originele foto"
          class="max-w-[90vw] max-h-[90vh] object-contain shadow-xl"
        >
      </div>
    </div>
  </Teleport>
</template>
