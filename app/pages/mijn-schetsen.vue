<script setup lang="ts">
import { Plus } from 'lucide-vue-next'
import type { SketchSummary } from '~/types/SketchSummary'

const { get, del } = useApi()
const { creating, createSketch } = useCreateSketch()

const sketches = ref<SketchSummary[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const sketchToDelete = ref<SketchSummary | null>(null)
const deleteError = ref<string | null>(null)
const deletePending = ref(false)

async function fetchSketches() {
  loading.value = true
  error.value = null
  try {
    sketches.value = await get<SketchSummary[]>('/api/sketches') ?? []
  } catch (e) {
    const err = e as { statusMessage?: string }
    error.value = err?.statusMessage ?? 'Er is een onbekende fout opgetreden.'
  } finally {
    loading.value = false
  }
}

const onDeleteRequest = (sketch: SketchSummary) => {
  sketchToDelete.value = sketch
  deleteError.value = null
}

const onDeleteCancel = () => {
  sketchToDelete.value = null
}

const onDeleteConfirm = async () => {
  if (!sketchToDelete.value) return
  deletePending.value = true
  try {
    await del(`/api/sketches/${sketchToDelete.value.id}`)
    sketches.value = sketches.value.filter(s => s.id !== sketchToDelete.value!.id)
    sketchToDelete.value = null
  } catch (e) {
    const err = e as { statusMessage?: string }
    deleteError.value = err?.statusMessage ?? 'Er is een fout opgetreden bij het verwijderen.'
  } finally {
    deletePending.value = false
  }
}

await fetchSketches()
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-4">
      <h1>Mijn Schetsen</h1>
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-900 active:bg-primary-700 text-white font-heading font-bold text-sm transition-colors disabled:opacity-50"
        :disabled="creating"
        @click="()=> createSketch()"
      >
        <Plus :size="16" />
        <span>{{ creating ? 'Aanmaken...' : 'Nieuwe schets' }}</span>
      </button>
    </div>

    <BaseGrid
      :loading="loading"
      :error="error"
      :is-empty="!loading && sketches.length === 0"
      empty-title="Geen schetsen gevonden"
      empty-message="Je hebt nog geen schetsen. Maak er een aan!"
      :cols="{ sm: 2, lg: 3, xl: 4 }"
    >
      <SketchCard
        v-for="sketch in sketches"
        :key="sketch.id"
        :sketch="sketch"
        @delete="onDeleteRequest"
      />
    </BaseGrid>

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
