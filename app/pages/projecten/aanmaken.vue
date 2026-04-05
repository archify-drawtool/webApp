<template>
  <div>
    <h1 class="mb-4">Project aanmaken</h1>
    <hr class="mb-6 border-[#86858F]">

    <p v-if="error" class="text-small px-4 py-2 bg-error-bg text-error-text mb-4">
      {{ error }}
    </p>

    <form class="flex flex-col gap-4 max-w-sm" @submit.prevent="submit">
      <div class="flex flex-col gap-1">
        <BaseInput
            id="project-naam"
            v-model="projectNaam"
            label="Project naam"
            variant="light"
            required
        />
        <p v-if="titleError" class="text-small text-error-text">{{ titleError }}</p>
      </div>

      <div class="flex gap-3 mt-2 justify-end">
        <SecondaryButton ghost type="button" @click="navigateTo('/projecten')">
          Annuleer
        </SecondaryButton>
        <PrimaryButton type="submit" :disabled="pending" variant="secondary">
          {{ pending ? 'Bezig...' : 'Aanmaken' }}
        </PrimaryButton>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
const { createProject } = useProjects();

const projectNaam = ref('');
const pending = ref(false);
const error = ref<string | null>(null);
const titleError = ref<string | null>(null);

const submit = async () => {
  pending.value = true;
  error.value = null;
  titleError.value = null;
  try {
    const project = await createProject(projectNaam.value);
    await navigateTo(`/projecten/${project.id}`);
  } catch (err) {
    const e = err as { statusCode?: number; statusMessage?: string };
    if (e?.statusCode === 422) {
      titleError.value = e.statusMessage ?? 'Ongeldige invoer';
    } else {
      error.value = e?.statusMessage ?? 'Er is een onbekende fout opgetreden';
    }
  } finally {
    pending.value = false;
  }
};
</script>