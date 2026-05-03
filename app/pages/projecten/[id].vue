<script setup lang="ts">
import { Pencil } from 'lucide-vue-next';
import type { Project } from '~/types/Project';
import type { Tab } from '~/components/TabNav.vue';
import type { SketchSummary } from '~/types/SketchSummary';

const route = useRoute();
const projectId = Number(route.params.id);

const { get } = useApi();
const { sketches, loading, error, fetchSketches, deleteSketch } = useSketches();

const project = ref<Project | null>(null);
const projectError = ref<string | null>(null);

const activeTab = ref('schetsen');
const tabs: Tab[] = [
  { key: 'schetsen', label: 'Schetsen' },
  { key: 'info', label: 'Project informatie' },
];

const sketchToDelete = ref<SketchSummary | null>(null);
const deleteError = ref<string | null>(null);
const deletePending = ref(false);

const onDeleteRequest = (sketch: SketchSummary) => {
  sketchToDelete.value = sketch;
  deleteError.value = null;
};

const onDeleteCancel = () => {
  sketchToDelete.value = null;
};

const onDeleteConfirm = async () => {
  if (!sketchToDelete.value) return;
  deletePending.value = true;
  try {
    await deleteSketch(projectId, sketchToDelete.value.id);
    sketchToDelete.value = null;
  } catch (e) {
    const err = e as { statusMessage?: string };
    deleteError.value = err?.statusMessage ?? 'Er is een fout opgetreden bij het verwijderen.';
  } finally {
    deletePending.value = false;
  }
};

try {
    project.value = await get<Project>(`/api/projects/${projectId}`) ?? null;
} catch (e) {
    const err = e as { statusMessage?: string };
    projectError.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden';
}

await fetchSketches(projectId);
</script>

<template>
  <div>
    <p v-if="projectError" class="text-small px-4 py-2 bg-error-bg text-error-text mb-4">
      {{ projectError }}
    </p>

    <template v-if="project">
      <h1 class="mb-4">{{ project.title }}</h1>

      <TabNav v-model="activeTab" :tabs="tabs" class="mb-6" />

      <!-- Tab: Schetsen -->
      <template v-if="activeTab === 'schetsen'">
        <h2 class="mb-4">Schetsen</h2>
        <BaseGrid
            :loading="loading"
            :error="error"
            :is-empty="false"
            :cols="{ sm: 2, lg: 3, xl: 4 }"
        >
          <NuxtLink
              :to="`/projecten/${projectId}/schetsen/aanmaken`"
              class="flex items-center justify-center gap-2 border-2 border-dashed border-black p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer"
          >
            <span class="font-heading text-h3">Begin met schetsen</span>
            <Pencil :size="20" />
          </NuxtLink>

          <SketchCard
              v-for="sketch in sketches"
              :key="sketch.id"
              :sketch="sketch"
              @delete="onDeleteRequest"
          />
        </BaseGrid>
      </template>

      <!-- Tab: Project informatie -->
      <template v-if="activeTab === 'info'">
        <h2 class="mb-4">Project informatie</h2>
        <p class="text-grey-600">Hier komt de project informatie.</p>
      </template>
    </template>

    <ConfirmDialog
      v-if="sketchToDelete"
      message="Weet je het zeker? Deze actie kan niet ongedaan worden gemaakt."
      :error="deleteError"
      :pending="deletePending"
      @confirm="onDeleteConfirm"
      @cancel="onDeleteCancel"
    />
  </div>
</template>
