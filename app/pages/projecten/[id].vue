<script setup lang="ts">
import { Pencil, Trash2 } from 'lucide-vue-next';
import type { Project } from '~/types/Project';

const route = useRoute();
const projectId = Number(route.params.id);

const { get } = useApi();
const { creating, createSketch } = useCreateSketch()
const { sketches, loading, error, fetchSketches, sketchToDelete, deleteError: sketchDeleteError, deletePending: sketchDeletePending, onDeleteRequest: onSketchDeleteRequest, onDeleteCancel: onSketchDeleteCancel, onDeleteConfirm: onSketchDeleteConfirm } = useSketches();
const { renameProject, projectToDelete, deleteError: projectDeleteError, deletePending: projectDeletePending, onDeleteRequest: onProjectDeleteRequest, onDeleteCancel: onProjectDeleteCancel, onDeleteConfirm: onProjectDeleteConfirm } = useProjects();

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

const renaming = ref(false);
const renameValue = ref('');
const renameInput = ref<HTMLInputElement | null>(null);
const renameError = ref<string | null>(null);

function startRename() {
  renameValue.value = project.value?.title ?? '';
  renameError.value = null;
  renaming.value = true;
  nextTick(() => {
    renameInput.value?.select();
  });
}

function cancelRename() {
  renaming.value = false;
  renameError.value = null;
}

async function confirmRename() {
  if (!renaming.value) return;

  const newTitle = renameValue.value.trim();

  if (!newTitle) {
    renameError.value = 'De naam mag niet leeg zijn.';
    return;
  }

  if (newTitle === project.value?.title) {
    renaming.value = false;
    return;
  }

  try {
    await renameProject(projectId, newTitle);
    project.value!.title = newTitle;
    renaming.value = false;
    renameError.value = null;
  } catch (err: unknown) {
    const apiErr = err as { data?: { data?: { errors?: { title?: string[] }; message?: string }; message?: string } };
    const msg =
      apiErr?.data?.data?.errors?.title?.[0] ??
      apiErr?.data?.data?.message ??
      apiErr?.data?.message ??
      'Opslaan mislukt. Probeer het opnieuw.';
    renameError.value = msg;
    renameValue.value = project.value?.title ?? '';
    renaming.value = false;
  }
}

function onRenameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault();
    confirmRename();
  } else if (e.key === 'Escape') {
    cancelRename();
  }
}

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
        <div class="flex items-center gap-1.5 min-w-0 flex-wrap">
          <template v-if="renaming">
            <span class="grid">
              <input
                ref="renameInput"
                v-model="renameValue"
                class="font-heading text-h1 bg-transparent border-b border-primary-500 outline-none min-w-4 [grid-area:1/1]"
                @keydown="onRenameKeydown"
                @blur="confirmRename"
              >
              <span class="font-heading text-h1 invisible whitespace-pre [grid-area:1/1]">{{ renameValue || ' ' }}</span>
            </span>
          </template>
          <template v-else>
            <h1>{{ project.title }}</h1>
            <button
              type="button"
              class="text-grey-400 hover:text-secondary-950 transition-colors shrink-0 cursor-pointer"
              title="Naam aanpassen"
              aria-label="Naam aanpassen"
              @click="startRename"
            >
              <Pencil :size="18" />
            </button>
          </template>
          <p v-if="renameError" class="text-error-text text-sm">{{ renameError }}</p>
        </div>

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
