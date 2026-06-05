<script setup lang="ts">
import { CircleCheck, CircleAlert, X } from 'lucide-vue-next'
import type { ToastVariant } from '~/types/Toast'

const props = withDefaults(defineProps<{
  message: string
  variant?: ToastVariant
}>(), {
  variant: 'success',
})

defineEmits<{
  close: []
}>()

const icon = computed(() => (props.variant === 'error' ? CircleAlert : CircleCheck))
const variantClass = computed(() =>
  props.variant === 'error'
    ? 'bg-error-bg text-error-text border-error-text'
    : 'bg-success-bg text-success-text border-success-text',
)
</script>

<template>
  <div
    class="pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-center gap-2.5 rounded-lg border px-3.5 py-3 font-body text-small shadow-lg"
    :class="variantClass"
    :role="variant === 'error' ? 'alert' : 'status'"
    :aria-live="variant === 'error' ? 'assertive' : 'polite'"
  >
    <component :is="icon" class="shrink-0" :size="20" :stroke-width="2.5" />
    <p class="m-0 flex-1 leading-snug break-words">{{ message }}</p>
    <button
      type="button"
      aria-label="Sluiten"
      class="flex h-[22px] w-[22px] shrink-0 cursor-pointer items-center justify-center rounded text-inherit opacity-70 transition-opacity hover:opacity-100"
      @click="$emit('close')"
    >
      <X :size="16" />
    </button>
  </div>
</template>
