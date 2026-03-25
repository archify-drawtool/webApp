<template>
  <div class="flex flex-col gap-1">
    <div class="flex justify-between items-center">
      <label :for="id" class="text-sm text-white">
        {{ label }}<span v-if="required" class="text-primary-500">*</span>
      </label>
      <slot name="right-label" />
    </div>
    <input
      :id="id"
      :type="type ?? 'text'"
      :value="modelValue"
      :required="required"
      class="w-full px-3 py-2 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    >
  </div>
</template>

<script setup lang="ts">
defineProps<{
  id: string
  label: string
  type?: string
  modelValue: string
  required?: boolean
}>()

defineEmits(['update:modelValue'])
</script>
