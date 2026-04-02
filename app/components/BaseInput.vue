<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center">
      <label :for="id" class="font-heading text-[19px] font-bold">
        {{ label }}<span v-if="required" class="text-primary-500">*</span>
      </label>
      <slot name="right-label" />
    </div>
    <input
      :id="id"
      :type="type"
      :value="modelValue"
      :required="required"
      :class="[
        'w-full px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500',
        variant === 'light'
          ? 'bg-white text-text border border-secondary-300'
          : 'bg-secondary-950 text-white border border-secondary-700'
      ]"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  id: string
  label: string
  type?: string
  modelValue: string
  required?: boolean
  variant?: 'light' | 'dark'
}>(), {
  type: 'text',
  variant: 'dark'
})

defineEmits(['update:modelValue'])
</script>

