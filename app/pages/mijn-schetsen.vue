<script setup lang="ts">
import { Plus } from 'lucide-vue-next'

const { creating, createSketch } = useCreateSketch()
const { sketches, loading, error, fetchSketches, sketchToDelete, deleteError, deletePending, onDeleteRequest, onDeleteCancel, onDeleteConfirm } = useSketches()

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
