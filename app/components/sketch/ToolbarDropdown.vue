<script setup lang="ts">
interface Item {
  key: string
  icon: Component
  label: string
}

defineProps<{
  items: Item[]
  selectedKey: string | null
  alignRight?: boolean
}>()

const emit = defineEmits<{
  select: [key: string]
}>()
</script>

<template>
  <div
    class="absolute bottom-full mb-2 rounded-xl bg-secondary-950 shadow-lg p-1 z-50"
    :class="alignRight ? 'right-0' : 'left-0'"
  >
    <button
      v-for="item in items"
      :key="item.key"
      class="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-grey-100 hover:bg-primary-500 hover:text-white transition-colors"
      @click.stop="emit('select', item.key)"
    >
      <span class="w-3 text-xs">{{ selectedKey === item.key ? '✓' : '' }}</span>
      <component :is="item.icon" :size="16" />
      <span class="text-sm">{{ item.label }}</span>
    </button>
  </div>
</template>
