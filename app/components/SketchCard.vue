<script setup lang="ts">
import type { SketchSummary } from '~/types/SketchSummary';
import { User } from 'lucide-vue-next';

defineProps<{
  sketch: SketchSummary;
}>();

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
  <NuxtLink
    :to="`/projecten/${sketch.project_id}/schetsen/${sketch.id}`"
    class="block bg-white border border-primary-500 p-4 hover:bg-primary-50 transition-colors"
  >
    <h3>{{ sketch.title }}</h3>
    <p v-if="sketch.creator" class="text-primary-500 text-small mt-1 flex items-center gap-1">
      <User :size="14" class="text-black" /> {{ sketch.creator.name }}
    </p>
    <p class="text-grey-600 text-small mt-1">
      Laatst bewerkt: {{ timeAgo(sketch.updated_at) }}
    </p>
  </NuxtLink>
</template>

