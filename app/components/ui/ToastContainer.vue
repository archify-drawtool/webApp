<script setup lang="ts">
const { toasts, remove } = useToast()
</script>

<template>
  <Teleport to="body">
    <div
      class="pointer-events-none fixed right-5 bottom-5 z-[9999] flex flex-col gap-2.5"
      aria-live="polite"
    >
      <TransitionGroup
        move-class="transition-transform duration-[250ms]"
        enter-active-class="transition-all duration-[250ms] ease-out"
        leave-active-class="absolute right-0 transition-all duration-[250ms] ease-out"
        enter-from-class="opacity-0 translate-x-5"
        leave-to-class="opacity-0 translate-x-5"
      >
        <UiToast
          v-for="toast in toasts"
          :key="toast.id"
          :message="toast.message"
          :variant="toast.variant"
          @close="remove(toast.id)"
        />
      </TransitionGroup>
    </div>
  </Teleport>
</template>
