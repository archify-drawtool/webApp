<script setup lang="ts">
import type { Project } from '~/types/Project';

defineProps<{
  projects: Project[];
  loading: boolean;
  error: string | null;
}>();
</script>

<template>
  <BaseGrid
      :loading="loading"
      :error="error"
      :is-empty="projects.length === 0"
      empty-title="Geen projecten gevonden"
      empty-message="Je hebt nog geen projecten. Maak een nieuw project aan om te beginnen."
      :cols="{ sm: 2, lg: 3, xl: 4 }"
  >
    <!-- New project card -->
    <NuxtLink
        to="/projecten/nieuw"
        class="flex items-center justify-center gap-2 border-2 border-dashed border-grey-400 rounded-lg p-4 h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
    >
      <span class="font-heading text-h3">Begin met schetsen</span>
      <span>✏️</span>
    </NuxtLink>

    <!-- Project cards -->
    <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
    />
  </BaseGrid>
</template>