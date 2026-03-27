<script setup lang="ts">
import type { Project } from '~/types/Project';

const props = defineProps<{
  project: Project;
}>();

const timeAgo = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { label: string; seconds: number }[] = [
    { label: 'jaar', seconds: 31536000 },
    { label: 'maand', seconds: 2592000 },
    { label: 'week', seconds: 604800 },
    { label: 'dag', seconds: 86400 },
    { label: 'uur', seconds: 3600 },
    { label: 'minuut', seconds: 60 },
  ];

  for (const interval of intervals) {
    const count = Math.floor(diffInSeconds / interval.seconds);
    if (count >= 1) {
      return count === 1
          ? `${count} ${interval.label} geleden`
          : `${count} ${interval.label}en geleden`;
    }
  }

  return 'Zojuist';
};
</script>

<template>
  <NuxtLink
      :to="`/projecten/${project.id}`"
      class="block bg-primary-50 rounded-lg p-4 hover:bg-primary-100 transition-colors cursor-pointer"
  >
    <h3>{{ project.title }}</h3>
    <p v-if="project.creator" class="text-primary-500 text-small mt-1">
      <span>👤</span> {{ project.creator.name }}
    </p>
    <p class="text-grey-600 text-small mt-1">
      Laatst bijgewerkt: {{ timeAgo(project.updated_at) }}
    </p>
  </NuxtLink>
</template>