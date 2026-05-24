<script setup lang="ts">
import { X } from 'lucide-vue-next';

defineProps<{
  message: string;
  error?: string | null;
  pending?: boolean;
}>();

const emit = defineEmits<{
  confirm: [];
  cancel: [];
}>();
</script>

<template>
  <Teleport to="body">
    <div class="backdrop" @click.self="emit('cancel')">
      <div class="dialog">
        <button
          type="button"
          class="close-btn"
          aria-label="Sluiten"
          :disabled="pending"
          @click="emit('cancel')"
        >
          <X :size="18" />
        </button>
        <p>{{ message }}</p>
        <p v-if="error" class="error">{{ error }}</p>
        <div class="dialog-actions">
          <SecondaryButton :disabled="pending" @click="emit('cancel')">Annuleren</SecondaryButton>
          <PrimaryButton variant="primary" :disabled="pending" @click="emit('confirm')">Verwijderen</PrimaryButton>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
.backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.dialog {
  position: relative;
  background: white;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
}

.close-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 1.75rem;
  height: 1.75rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-grey-600);
  transition: color 0.15s ease;
}

.close-btn:hover {
  color: var(--color-text);
}

.close-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.error {
  margin-top: 0.75rem;
  font-size: var(--text-small);
  color: var(--color-error-text);
  background-color: var(--color-error-bg);
  padding: 0.5rem 0.75rem;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-top: 1.5rem;
}
</style>
