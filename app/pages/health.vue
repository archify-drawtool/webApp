<template>
  <div>
    <h1>API Health Check</h1>

    <button :disabled="pending" @click="refresh">
      {{ pending ? 'Bezig...' : 'Vernieuw' }}
    </button>

    <p v-if="pending">Laden...</p>
    <p v-else-if="error">Fout: {{ errorMessage }}</p>

    <div v-else-if="healthData">
      <p><b>Status:</b> {{ healthData.status }} <br> <b>Laatste check:</b> {{ lastChecked }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { useHealth } from '~/composables/useHealth'
  import type { HealthResponse } from '~/types/Health'

  const { checkHealth } = useHealth()

  const pending = ref(false)
  const healthData = ref<HealthResponse | null>(null)
  const error = ref<Error | null>(null)
  const lastChecked = ref<string | null>(null)

  const errorMessage = computed(() => error.value?.message || 'Onbekende fout')

  const refresh = async () => {
    pending.value = true
    error.value = null
    healthData.value = null
    try {
      healthData.value = await checkHealth() ?? null
      lastChecked.value = new Date().toLocaleTimeString('nl-NL')
    } catch (err) {
      error.value = err as Error
    } finally {
      pending.value = false
    }
  }

  onMounted(() => refresh())
</script>