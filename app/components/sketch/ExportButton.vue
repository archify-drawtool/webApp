<script setup lang="ts">
import { Download } from 'lucide-vue-next'

const props = defineProps<{
  sketchId: number
  projectId: number
  title: string
}>()

const config = useRuntimeConfig()
const token = useCookie<string | null>('auth_token')

const loading = ref(false)
const error = ref<string | null>(null)

async function exportMermaid() {
  loading.value = true
  error.value = null

  try {
    const url = `${config.public.apiBaseUrl}/api/projects/${props.projectId}/sketches/${props.sketchId}/export/mermaid`

    const text = await $fetch<string>(url, {
      headers: { Authorization: `Bearer ${token.value}` },
      responseType: 'text',
    })

    const blob = new Blob([text], { type: 'text/plain' })
    const objectUrl = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = objectUrl
    anchor.download = `${props.title || 'schets'}.mmd`
    document.body.appendChild(anchor)
    anchor.click()
    document.body.removeChild(anchor)
    URL.revokeObjectURL(objectUrl)
  } catch {
    error.value = 'Export mislukt. Probeer het opnieuw.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="flex flex-col items-end gap-2">
    <button
      :disabled="loading"
      class="flex items-center gap-2 px-3 py-2 rounded bg-secondary-900 text-white text-xs hover:bg-secondary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      @click="exportMermaid"
    >
      <Download :size="14" />
      {{ loading ? 'Exporteren...' : 'Mermaid' }}
    </button>

    <p v-if="error" class="text-small px-4 py-2 bg-error-bg text-error-text max-w-48 text-right">
      {{ error }}
    </p>
  </div>
</template>
