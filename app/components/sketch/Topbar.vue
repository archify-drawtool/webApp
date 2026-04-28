<script setup lang="ts">
import { ArrowLeft, Download, ChevronDown, FileImage, GitBranch, Pencil } from 'lucide-vue-next'

const props = defineProps<{
  sketchTitle: string
  backTo: string
  sketchId?: number
  projectId?: number
}>()

const config = useRuntimeConfig()
const token = useCookie<string | null>('auth_token')
const { patch } = useApi()
const { updateTitle } = useSketchTopbar()

const dropdownOpen = ref(false)
const loading = ref(false)
const error = ref<string | null>(null)

// ── Rename state ──────────────────────────────────────────────
const renaming = ref(false)
const renameValue = ref('')
const renameInput = ref<HTMLInputElement | null>(null)
const renameError = ref<string | null>(null)

function startRename() {
  renameValue.value = props.sketchTitle
  renameError.value = null
  renaming.value = true
  nextTick(() => {
    renameInput.value?.select()
  })
}

function cancelRename() {
  renaming.value = false
  renameError.value = null
}

async function confirmRename() {
  if (!renaming.value) return

  const newTitle = renameValue.value.trim()

  if (!newTitle) {
    renameError.value = 'De naam mag niet leeg zijn.'
    return
  }

  if (newTitle === props.sketchTitle) {
    renaming.value = false
    return
  }

  if (!props.sketchId || !props.projectId) return

  try {
    await patch(
      `/api/projects/${props.projectId}/sketches/${props.sketchId}/rename`,
      { title: newTitle },
    )
    updateTitle(newTitle)
    renaming.value = false
    renameError.value = null
  } catch (err: unknown) {
    const apiErr = err as { data?: { errors?: { title?: string[] }; message?: string } }
    const msg =
      apiErr?.data?.errors?.title?.[0] ??
      apiErr?.data?.message ??
      'Opslaan mislukt. Probeer het opnieuw.'
    renameError.value = msg
    renameValue.value = props.sketchTitle
    renaming.value = false
  }
}

function onRenameKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter') {
    e.preventDefault()
    confirmRename()
  } else if (e.key === 'Escape') {
    cancelRename()
  }
}
// ─────────────────────────────────────────────────────────────

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
</script>

<template>
  <div v-if="dropdownOpen" class="fixed inset-0 z-40" @mousedown="dropdownOpen = false" />

  <header class="relative flex items-center h-12 px-4 bg-secondary-950 border-b border-secondary-700 shrink-0 z-50">

    <NuxtLink
      :to="backTo"
      class="flex items-center gap-1.5 text-grey-200 hover:text-white transition-colors text-sm font-heading font-bold"
    >
      <ArrowLeft :size="16" />
      <span>Terug</span>
    </NuxtLink>

    <!-- Rename: bewerkbare schetsnaam -->
    <div class="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0">
      <div class="flex items-center gap-1.5 max-w-xs">
        <template v-if="renaming">
          <input
            ref="renameInput"
            v-model="renameValue"
            class="font-heading font-bold text-white text-base bg-transparent border-b border-primary-500 outline-none text-center min-w-0 max-w-[220px]"
            @keydown="onRenameKeydown"
            @blur="confirmRename"
          />
        </template>
        <template v-else>
          <span class="font-heading font-bold text-white text-base truncate">
            {{ sketchTitle }}
          </span>
          <button
            class="text-grey-400 hover:text-white transition-colors shrink-0"
            title="Naam aanpassen"
            @click="startRename"
          >
            <Pencil :size="14" />
          </button>
        </template>
      </div>
      <p v-if="renameError" class="text-error-text text-xs whitespace-nowrap mt-0.5">
        {{ renameError }}
      </p>
    </div>

    <div class="ml-auto relative z-50">
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
        <button class="flex items-center gap-2 px-3 py-2 rounded-md w-full text-grey-100 hover:bg-secondary-700 transition-colors text-sm cursor-pointer">
          <FileImage :size="15" />
          <span>PNG</span>
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
