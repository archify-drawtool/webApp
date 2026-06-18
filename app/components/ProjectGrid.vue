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
      :is-empty="false"
      :cols="{ sm: 2, lg: 3, xl: 4 }"
  >
    <!-- New project card -->
    <NuxtLink
        to="/projecten/aanmaken"
        class="flex flex-row items-center justify-center gap-2 border-2 border-dashed border-black p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer w-full"
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