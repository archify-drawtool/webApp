<script setup lang="ts">
export interface Tab {
  key: string;
  label: string;
}

defineProps<{
  tabs: Tab[];
  modelValue: string;
}>();

const emit = defineEmits<{
  (_e: 'update:modelValue', _value: string): void;
}>();

const select = (key: string) => {
  emit('update:modelValue', key);
};
</script>

<template>
  <nav class="flex gap-6 border-b-2 border-grey-200">
    <button
        v-for="tab in tabs"
        :key="tab.key"
        class="font-heading text-h3 font-bold pb-2 -mb-[1px] border-b-2 border-transparent text-grey-400 cursor-pointer transition-colors hover:text-primary-500"
        :class="{ 'text-primary-500! border-primary-500!': modelValue === tab.key }"
        @click="select(tab.key)"
    >
      {{ tab.label }}
    </button>
  </nav>
</template>
