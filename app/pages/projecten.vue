<script setup lang="ts">
const { projects, loading, error, fetchProjects } = useProjects();

await fetchProjects();
</script>

<template>
  <div>
    <h1 class="mb-6">Projecten</h1>
    <ProjectGrid
        :projects="projects"
        :loading="loading"
        :error="error"
    />
  </div>
</template>