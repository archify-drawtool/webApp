<script setup lang="ts">
import type { SketchSummary } from '~/types/SketchSummary';
import { User, Trash2 } from 'lucide-vue-next';

const props = defineProps<{
  sketch: SketchSummary;
}>();

const emit = defineEmits<{
  delete: [sketch: SketchSummary];
}>();

const { user } = useAuth();
const isOwner = computed(() => user.value?.id === props.sketch.created_by);

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; plural: string; seconds: number }[] = [
    { label: 'jaar', plural: 'jaren', seconds: 31536000 },
    { label: 'maand', plural: 'maanden', seconds: 2592000 },
    { label: 'week', plural: 'weken', seconds: 604800 },
    { label: 'dag', plural: 'dagen', seconds: 86400 },
    { label: 'uur', plural: 'uren', seconds: 3600 },
    { label: 'minuut', plural: 'minuten', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return count === 1
          ? `${count} ${interval.label} geleden`
          : `${count} ${interval.plural} geleden`;
    }
  }

  return 'Zojuist';
};
</script>

<template>
  <div class="sketch-card-wrapper h-full">
    <NuxtLink
      :to="`/projecten/${sketch.project_id}/schetsen/${sketch.id}`"
      class="block h-full bg-white border border-primary-500 p-4 pr-10 hover:bg-primary-50 transition-colors"
    >
      <h3>{{ sketch.title }}</h3>
      <p v-if="sketch.creator" class="text-primary-500 text-small mt-1 flex items-center gap-1">
        <User :size="14" class="text-black" /> {{ sketch.creator.name }}
      </p>
      <p class="text-grey-600 text-small mt-1">
        Laatst bewerkt: {{ timeAgo(sketch.updated_at) }}
      </p>
    </NuxtLink>
    <button
      v-if="isOwner"
      class="delete-btn"
      aria-label="Schets verwijderen"
      @click.prevent="emit('delete', sketch)"
    >
      <Trash2 :size="16" />
    </button>
  </div>
</template>

<style scoped>
.sketch-card-wrapper {
  position: relative;
}

.delete-btn {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2rem;
  height: 2rem;
  background: transparent;
  border: none;
  cursor: pointer;
  color: var(--color-grey-600, #6e6c79);
  transition: color 0.15s ease;
}

.delete-btn:hover {
  color: #dc2626;
}
</style>
