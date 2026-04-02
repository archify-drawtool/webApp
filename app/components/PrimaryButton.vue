<template>
  <button :disabled="disabled" :type="type ?? 'button'" :class="['primary-btn', variant]">
    <slot />
  </button>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary'
}>(), {
  variant: 'primary',
  type: 'button'
})
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
  transition: background-color 0.15s ease;
  white-space: nowrap;
}

.primary-btn.primary {
  background-color: var(--color-primary-500);
}
.primary-btn.primary:hover {
  background-color: var(--color-primary-900);
}
.primary-btn.primary:active {
  background-color: var(--color-primary-700);
}
.primary-btn.primary:disabled {
  background-color: var(--color-primary-50);
  cursor: not-allowed;
}

.primary-btn.secondary {
  background-color: var(--color-secondary-950);
}
.primary-btn.secondary:hover {
  background-color: var(--color-secondary-900);
}
.primary-btn.secondary:active {
  background-color: var(--color-secondary-700);
}
.primary-btn.secondary:disabled {
  background-color: var(--color-grey-100);
  cursor: not-allowed;
}
</style>