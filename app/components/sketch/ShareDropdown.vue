<script setup lang="ts">
import { Share2, ChevronDown, Copy, Check } from 'lucide-vue-next'
import type { SketchShareState } from '~/types/SharedSketch'

const props = defineProps<{
  sketchId?: number
  projectId?: number
}>()

const { get, post } = useApi()

const dropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const shareState = ref<SketchShareState | null>(null)
const loadingState = ref(false)
const toggling = ref(false)
const stateError = ref<string | null>(null)

const copied = ref(false)
let copiedTimer: ReturnType<typeof setTimeout> | null = null

const hasFetched = ref(false)

const publicUrl = computed(() => {
  if (!shareState.value?.is_active || !shareState.value?.token) return null
  const origin = useRequestURL().origin
  return `${origin}/gedeeld/${shareState.value.token}`
})

async function fetchShareState() {
  if (!props.sketchId || !props.projectId) return
  loadingState.value = true
  stateError.value = null
  try {
    const result = await get<SketchShareState>(
      `/api/projects/${props.projectId}/sketches/${props.sketchId}/share`,
    )
    if (result) shareState.value = result
  } catch {
    stateError.value = 'Status ophalen mislukt.'
  } finally {
    loadingState.value = false
    hasFetched.value = true
  }
}

async function toggleShare() {
  if (!props.sketchId || !props.projectId || toggling.value) return
  toggling.value = true
  stateError.value = null
  try {
    const result = await post<SketchShareState>(
      `/api/projects/${props.projectId}/sketches/${props.sketchId}/share`,
    )
    if (result) shareState.value = result
  } catch {
    stateError.value = 'Wijzigen mislukt. Probeer het opnieuw.'
  } finally {
    toggling.value = false
  }
}

async function copyLink() {
  if (!publicUrl.value) return
  await navigator.clipboard.writeText(publicUrl.value)
  copied.value = true
  if (copiedTimer) clearTimeout(copiedTimer)
  copiedTimer = setTimeout(() => { copied.value = false }, 2000)
}

function onDocumentClick(e: MouseEvent) {
  if (dropdownRef.value && !dropdownRef.value.contains(e.target as Node)) {
    dropdownOpen.value = false
  }
}

watch(dropdownOpen, (open) => {
  if (open) {
    document.addEventListener('click', onDocumentClick)
    if (!hasFetched.value) fetchShareState()
  } else {
    document.removeEventListener('click', onDocumentClick)
  }
})

onUnmounted(() => {
  document.removeEventListener('click', onDocumentClick)
  if (copiedTimer) clearTimeout(copiedTimer)
})
</script>

<template>
  <div ref="dropdownRef" class="relative z-50">
    <button
      class="flex items-center gap-1.5 px-3 py-1.5 bg-secondary-900 hover:bg-secondary-700 border border-secondary-700 text-grey-100 font-heading font-bold text-sm transition-colors"
      @click="dropdownOpen = !dropdownOpen"
    >
      <Share2 :size="15" />
      <span>Delen</span>
      <ChevronDown :size="14" class="transition-transform" :class="{ 'rotate-180': dropdownOpen }" />
    </button>

    <div
      v-if="dropdownOpen"
      class="absolute top-full right-0 mt-1 bg-secondary-900 border border-secondary-700 rounded-lg p-3 w-72"
    >
      <div v-if="loadingState" class="text-grey-400 text-sm text-center py-2">
        Laden...
      </div>

      <template v-else>
        <p v-if="stateError" class="text-[var(--color-error-text)] text-xs mb-2">
          {{ stateError }}
        </p>

        <div class="flex items-center justify-between gap-3">
          <span class="text-grey-100 text-sm font-heading font-bold">Openbaar delen</span>
          <button
            :disabled="toggling"
            :class="[
              'relative w-10 h-5 rounded-full transition-colors shrink-0 focus:outline-none',
              shareState?.is_active ? 'bg-primary-500' : 'bg-secondary-700',
              toggling ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            ]"
            :aria-pressed="shareState?.is_active ?? false"
            :aria-label="shareState?.is_active ? 'Deel uitschakelen' : 'Deel inschakelen'"
            @click.stop="toggleShare"
          >
            <span
              :class="[
                'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform',
                shareState?.is_active ? 'translate-x-5' : 'translate-x-0',
              ]"
            />
          </button>
        </div>

        <div v-if="shareState?.is_active && publicUrl" class="mt-3 flex items-center gap-2">
          <input
            :value="publicUrl"
            readonly
            class="flex-1 text-xs bg-secondary-950 border border-secondary-700 rounded px-2 py-1 text-grey-200 outline-none truncate"
            @click.stop
          >
          <button
            class="flex items-center gap-1 px-2 py-1 bg-primary-500 hover:bg-primary-700 text-white text-xs rounded transition-colors shrink-0"
            @click.stop="copyLink"
          >
            <Check v-if="copied" :size="13" />
            <Copy v-else :size="13" />
            <span>{{ copied ? 'Gekopieerd' : 'Kopieer link' }}</span>
          </button>
        </div>
      </template>
    </div>
  </div>
</template>
