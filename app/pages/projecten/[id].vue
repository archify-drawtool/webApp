<script setup lang="ts">
import { Pencil } from 'lucide-vue-next';
import type { Project } from '~/types/Project';
import type { Tab } from '~/components/TabNav.vue';
import type { SketchSummary } from '~/types/SketchSummary';
import type { Sketch } from '~/types/Sketch';

const route = useRoute();
const projectId = Number(route.params.id);

const { get, post } = useApi();
const { sketches, loading, error, fetchSketches, deleteSketch } = useSketches();

const createPending = ref(false);
const createError = ref<string | null>(null);

function generateSketchTitle(): string {
  const maanden = [
    'januari', 'februari', 'maart', 'april', 'mei', 'juni',
    'juli', 'augustus', 'september', 'oktober', 'november', 'december',
  ];
  const now = new Date();
  const dag = now.getDate();
  const maand = maanden[now.getMonth()];
  const uur = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  return `Schets ${dag} ${maand} ${uur}:${min}`;
}

async function createSketch() {
  createPending.value = true;
  createError.value = null;
  try {
    const schets = await post<Sketch>(
      `/api/projects/${projectId}/sketches`,
      { title: generateSketchTitle() },
    );
    if (!schets?.id) throw new Error('Geen geldig schets-ID ontvangen.');
    await navigateTo(`/projecten/${projectId}/schetsen/${schets.id}`);
  } catch (e) {
    const err = e as { statusMessage?: string; message?: string };
    createError.value = err?.statusMessage ?? err?.message ?? 'Schets kon niet worden aangemaakt.';
  } finally {
    createPending.value = false;
  }
}

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
          <button
              :disabled="createPending"
              class="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-black p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
              @click="createSketch"
          >
            <span class="font-heading text-h3">{{ createPending ? 'Aanmaken...' : 'Begin met schetsen' }}</span>
            <Pencil :size="20" />
            <span v-if="createError" class="text-[var(--color-error-text)] text-sm mt-1">{{ createError }}</span>
          </button>

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
