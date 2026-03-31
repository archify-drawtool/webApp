<script setup lang="ts">
import { Pencil } from 'lucide-vue-next';
import type { Project } from '~/types/Project';

const route = useRoute();
const projectId = Number(route.params.id);

const { get } = useApi();
const { schetsen, loading, error, getSchetsen } = useSchetsen();

const project = ref<Project | null>(null);
const projectError = ref<string | null>(null);

try {
    project.value = await get<Project>(`/api/projects/${projectId}`) ?? null;
} catch (e) {
    const err = e as { statusMessage?: string };
    projectError.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
}

await getSchetsen(projectId);
</script>

<template>
  <div>
    <p v-if="projectError" class="text-small px-4 py-2 bg-error-bg text-error-text mb-4">
      {{ projectError }}
    </p>

    <template v-if="project">
      <h1 class="mb-4">{{ project.title }}</h1>
      <hr class="mb-6" style="border-color: #86858F;">

      <h2 class="mb-4">Schetsen</h2>
      <BaseGrid
          :loading="loading"
          :error="error"
          :is-empty="false"
          :cols="{ sm: 2, lg: 3, xl: 4 }"
      >
        <NuxtLink
            :to="`/projecten/${projectId}/schetsen/aanmaken`"
            class="flex items-center justify-center gap-2 border-2 border-dashed border-grey-400 rounded-lg p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
        >
          <span class="font-heading text-h3">Begin met schetsen</span>
          <Pencil :size="20" />
        </NuxtLink>

        <SchetsenCard
            v-for="schets in schetsen"
            :key="schets.id"
            :schets="schets"
        />
      </BaseGrid>
    </template>
  </div>
</template>
