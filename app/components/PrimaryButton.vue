<template>
  <button :disabled="disabled" :type="type ?? 'button'" class="primary-btn">
    <slot />
  </button>
</template>

<script setup lang="ts">
defineProps<{
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}>()
</script>

<style scoped>
.primary-btn {
  padding: 0.50rem 0.75rem;
  font-family: var(--font-heading);
  font-size: var(--text-base);
  font-weight: 700;
  color: white;
  border: none;
  cursor: pointer;
  background-color: var(--color-primary-500);
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.primary-btn:hover {
  background-color: var(--color-primary-900);
}

.primary-btn:active {
  background-color: var(--color-primary-700);
}

.primary-btn:disabled {
  background-color: var(--color-primary-50);
  cursor: not-allowed;
}
</style>