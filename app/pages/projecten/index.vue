<script setup lang="ts">
import { X } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();
const { projects, loading, error, fetchProjects } = useProjects();

await fetchProjects();

const deletedTitle = computed(() => {
    const value = route.query.deleted;
    return typeof value === 'string' && value.length > 0 ? value : null;
});

const dismissSuccess = () => {
    const { deleted: _deleted, ...rest } = route.query;
    router.replace({ path: route.path, query: rest });
};
</script>

<template>
  <div>
    <div
        v-if="deletedTitle"
        class="flex items-center justify-between gap-4 text-small px-4 py-2 bg-grey-100 text-secondary-950 mb-4"
        role="status"
    >
      <span>Project &ldquo;{{ deletedTitle }}&rdquo; is verwijderd.</span>
      <button
          type="button"
          class="cursor-pointer hover:opacity-70"
          aria-label="Melding sluiten"
          @click="dismissSuccess"
      >
        <X :size="16" />
      </button>
    </div>

    <h1 class="mb-6">Projecten</h1>
    <ProjectGrid
        :projects="projects"
        :loading="loading"
        :error="error"
    />
  </div>
</template>

