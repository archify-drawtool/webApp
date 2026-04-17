<script setup lang="ts">
import { ArrowLeft, Download, ChevronDown, FileImage, GitBranch } from 'lucide-vue-next'

const props = defineProps<{
  sketchTitle: string
  backTo: string
  sketchId?: number
  projectId?: number
}>()

const config = useRuntimeConfig()
const token = useCookie<string | null>('auth_token')

const dropdownOpen = ref(false)
const isExporting = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)
const loading = ref(false)
const error = ref<string | null>(null)

const { exportAsPng } = useExport()

async function exportMermaid() {
  if (!props.sketchId || !props.projectId) return

  dropdownOpen.value = false
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
    anchor.download = `${props.sketchTitle || 'schets'}.mmd`
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

async function handleExportPng() {
  dropdownOpen.value = false
  isExporting.value = true
  try {
    await exportAsPng(props.sketchTitle)
  } finally {
    isExporting.value = false
  }
}

function onDocumentClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

watch(dropdownOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick)
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
})
</script>

<template>

  <header class="relative flex items-center h-12 px-4 bg-secondary-950 border-b border-secondary-700 shrink-0 z-50">

    <NuxtLink
      :to="backTo"
      class="flex items-center gap-1.5 text-grey-200 hover:text-white transition-colors text-sm font-heading font-bold"
    >
      <ArrowLeft :size="16" />
      <span>Terug</span>
    </NuxtLink>

    <span class="absolute left-1/2 -translate-x-1/2 font-heading font-bold text-white text-base truncate max-w-xs pointer-events-none">
      {{ sketchTitle }}
    </span>

    <div ref="dropdownRef" class="ml-auto relative z-50">
      <button
        class="flex items-center gap-1.5 px-3 py-1.5 bg-primary-500 hover:bg-primary-900 active:bg-primary-700 text-white font-heading font-bold text-sm transition-colors"
        :disabled="loading"
        @click="dropdownOpen = !dropdownOpen"
      >
        <Download :size="15" />
        <span>{{ loading ? 'Exporteren...' : 'Exporteren' }}</span>
        <ChevronDown :size="14" class="transition-transform" :class="{ 'rotate-180': dropdownOpen }" />
      </button>

      <div
        v-if="dropdownOpen"
        class="absolute top-full right-0 mt-1 bg-secondary-900 border border-secondary-700 rounded-lg p-1 min-w-36"
      >
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-md w-full text-grey-100 hover:bg-secondary-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="isExporting"
          @click="handleExportPng"
        >
          <FileImage :size="15" />
          <span>{{ isExporting ? 'Exporteren...' : 'PNG' }}</span>
        </button>
        <button
          class="flex items-center gap-2 px-3 py-2 rounded-md w-full text-grey-100 hover:bg-secondary-700 transition-colors text-sm cursor-pointer"
          @click="exportMermaid"
        >
          <GitBranch :size="15" />
          <span>Mermaid</span>
        </button>
      </div>
    </div>

  </header>

  <div
    v-if="error"
    class="fixed top-12 right-4 mt-2 px-4 py-2 bg-error-bg text-error-text text-sm text-right rounded z-50"
  >
    {{ error }}
  </div>
</template>
