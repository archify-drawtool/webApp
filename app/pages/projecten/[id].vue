<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next';
import type { Project } from '~/types/Project';

const route = useRoute();
const projectId = Number(route.params.id);

const { get } = useApi();
const { creating, createSketch } = useCreateSketch()
const { sketches, loading, error, fetchSketches, sketchToDelete, deleteError: sketchDeleteError, deletePending: sketchDeletePending, onDeleteRequest: onSketchDeleteRequest, onDeleteCancel: onSketchDeleteCancel, onDeleteConfirm: onSketchDeleteConfirm } = useSketches();
const { projectToDelete, deleteError: projectDeleteError, deletePending: projectDeletePending, onDeleteRequest: onProjectDeleteRequest, onDeleteCancel: onProjectDeleteCancel, onDeleteConfirm: onProjectDeleteConfirm } = useProjects();

const createError = ref<string | null>(null);

const project = ref<Project | null>(null);
const projectError = ref<string | null>(null);

try {
    project.value = await get<Project>(`/api/projects/${projectId}`) ?? null;
} catch (e) {
    const err = e as { statusMessage?: string };
    projectError.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
}

await fetchSketches(projectId);

const requestProjectDelete = () => {
    if (project.value) onProjectDeleteRequest(project.value);
};

const confirmProjectDelete = async () => {
    const deleted = await onProjectDeleteConfirm();
    if (deleted) {
        await navigateTo({ path: '/projecten', query: { deleted: deleted.title } });
    }
};
</script>

<template>
  <div>
    <p v-if="projectError" class="text-small px-4 py-2 bg-error-bg text-error-text mb-4">
      {{ projectError }}
    </p>

    <template v-if="project">
      <div class="flex items-start justify-between gap-4 mb-4">
        <h1>{{ project.title }}</h1>
        <button
          type="button"
          class="flex items-center gap-2 text-grey-600 hover:text-primary-500 transition-colors cursor-pointer"
          aria-label="Project verwijderen"
          @click="requestProjectDelete"
        >
          <Trash2 :size="18" />
          <span class="text-small">Verwijderen</span>
        </button>
      </div>

      <h2 class="mb-4">Schetsen</h2>
      <BaseGrid
          :loading="loading"
          :error="error"
          :is-empty="false"
          :cols="{ sm: 2, lg: 3, xl: 4 }"
      >
        <button
            :disabled="creating"
            class="flex flex-row items-center justify-center gap-2 border-2 border-dashed border-black p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
            @click="() => createSketch(projectId)"
        >
          <span class="font-heading text-h3">{{ creating ? 'Aanmaken...' : 'Begin met schetsen' }}</span><Pencil :size="20" />
          <span v-if="createError" class="text-error-text text-sm mt-1">{{ createError }}</span>
        </button>

        <SketchCard
            v-for="sketch in sketches"
            :key="sketch.id"
            :sketch="sketch"
            @delete="onSketchDeleteRequest"
        />
      </BaseGrid>
    </template>

    <ConfirmDialog
      v-if="sketchToDelete"
      message="Weet je het zeker? Deze actie kan niet ongedaan worden gemaakt."
      :error="sketchDeleteError"
      :pending="sketchDeletePending"
      @confirm="onSketchDeleteConfirm"
      @cancel="onSketchDeleteCancel"
    />

    <ConfirmDialog
      v-if="projectToDelete"
      message="Weet je zeker dat je dit project en alle bijbehorende schetsen wilt verwijderen?"
      :error="projectDeleteError"
      :pending="projectDeletePending"
      @confirm="confirmProjectDelete"
      @cancel="onProjectDeleteCancel"
    />
  </div>
</template>
