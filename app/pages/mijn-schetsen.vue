<script setup lang="ts">
import { Pencil } from 'lucide-vue-next'

const { creating, createSketch } = useCreateSketch()
const { sketches, loading, error, fetchSketches, sketchToDelete, deleteError, deletePending, onDeleteRequest, onDeleteCancel, onDeleteConfirm } = useSketches()

await fetchSketches()
</script>

<template>
  <div>
    <h1 class="mb-4">Mijn Schetsen</h1>

    <BaseGrid
      :loading="loading"
      :error="error"
      :is-empty="false"
      :cols="{ sm: 2, lg: 3, xl: 4 }"
    >
      <button
        :disabled="creating"
        class="flex flex-row items-center justify-center gap-2 border-2 border-dashed border-black p-4 min-h-28 hover:border-primary-500 hover:text-primary-500 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed w-full"
        @click="() => createSketch()"
      >
        <span class="font-heading text-h3">{{ creating ? 'Aanmaken...' : 'Begin met schetsen' }}</span><Pencil :size="20" />
      </button>

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
