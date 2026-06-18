<script setup lang="ts">
import type { Project } from '~/types/Project';
import { Pencil } from 'lucide-vue-next';

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
      :cols="{ sm: 2, lg: 3, xl: 4 }"
  >
    <!-- New project card -->
    <NuxtLink
        to="/projecten/aanmaken"
        class="flex items-center justify-center gap-2 border-2 border-dashed border-black p-4 h-full hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
    >
      <span class="font-heading text-h3">Nieuw project</span>
      <Pencil :size="20" />
    </NuxtLink>

    <!-- Project cards -->
    <ProjectCard
        v-for="project in projects"
        :key="project.id"
        :project="project"
    />
  </BaseGrid>
</template>