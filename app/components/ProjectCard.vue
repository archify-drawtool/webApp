<script setup lang="ts">
import type { Project } from '~/types/Project';
import { User } from 'lucide-vue-next';

defineProps<{
  project: Project;
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
      :to="`/projecten/${project.id}`"
      class="block bg-primary-50 p-4 hover:bg-primary-100 transition-colors cursor-pointer"
  >
    <h3>{{ project.title }}</h3>
    <p v-if="project.creator" class="text-primary-500 text-small mt-1 flex items-center gap-1">
      <User :size="14" class="text-black" /> {{ project.creator.name }}
    </p>
    <p class="text-grey-600 text-small mt-1">
      Laatst bijgewerkt: {{ timeAgo(project.updated_at) }}
    </p>
  </NuxtLink>
</template>