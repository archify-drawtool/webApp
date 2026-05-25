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
      <div class="dialog relative">
        <button
          type="button"
          class="absolute top-2 right-2 flex items-center justify-center w-7 h-7 bg-transparent border-none cursor-pointer text-grey-600 transition-colors duration-150 hover:text-text disabled:cursor-not-allowed disabled:opacity-50"
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
  background: white;
  padding: 1.5rem;
  width: 100%;
  max-width: 400px;
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
