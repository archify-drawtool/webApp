<template>
  <button :disabled="disabled" :type="type ?? 'button'" :class="['secondary-btn', { 'secondary-btn--ghost': ghost }]">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  ghost?: boolean
}>()
</script>

<style scoped>
.secondary-btn {
  padding: 0.50rem 0.75rem;
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 700;
  color: var(--color-text);
  background-color: transparent;
  border: 2px solid var(--color-grey-200);
  cursor: pointer;
  transition: background-color 0.15s ease, border-color 0.15s ease;
  white-space: nowrap;
}

.secondary-btn:hover {
  background-color: var(--color-grey-100);
  border-color: var(--color-grey-400);
}

.secondary-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.secondary-btn--ghost {
  border: none;
  color: #6E6C79;
}

.secondary-btn--ghost:hover {
  border: none;
  background-color: transparent;
}
</style>

