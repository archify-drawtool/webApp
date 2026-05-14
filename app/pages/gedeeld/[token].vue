<script setup lang="ts">
import { Image as ImageIcon } from 'lucide-vue-next'
import type { SharedSketch } from '~/types/SharedSketch'

definePageMeta({
  layout: 'public',
})

const route = useRoute()
const config = useRuntimeConfig()
const token = route.params.token as string

const { fetchShared } = useSharedSketch()

const publicMeta = useState<{ title: string; projectTitle: string } | null>('public-page-meta', () => null)

const loading = ref(true)
const sketch = ref<SharedSketch | null>(null)
const notFound = ref(false)
const fetchError = ref<string | null>(null)

const photoOpen = ref(false)
const photoSrc = computed(() =>
  sketch.value?.has_photo
    ? `${config.public.apiBaseUrl}/api/shared/${token}/photo`
    : null,
)

onMounted(async () => {
  try {
    const result = await fetchShared(token)
    if (result === null) {
      notFound.value = true
    } else {
      sketch.value = result
      publicMeta.value = {
        title: result.title,
        projectTitle: result.project_title,
      }
    }
  } catch {
    fetchError.value = 'Er is een fout opgetreden. Probeer het later opnieuw.'
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  publicMeta.value = null
})
</script>

<template>
  <div class="relative w-full h-full">

    <div v-if="loading" class="absolute inset-0 flex items-center justify-center">
      <span class="text-grey-400 text-sm">Schets laden...</span>
    </div>

    <div
      v-else-if="notFound"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3"
    >
      <p class="text-grey-200 text-base text-center px-8">
        Deze link is niet meer geldig.
      </p>
    </div>

    <div
      v-else-if="fetchError"
      class="absolute inset-0 flex flex-col items-center justify-center gap-3"
    >
      <p class="text-error-text text-base text-center px-8">
        {{ fetchError }}
      </p>
    </div>

    <SketchPublicCanvas
      v-else-if="sketch"
      :nodes="sketch.canvas_state?.nodes ?? []"
      :edges="sketch.canvas_state?.edges ?? []"
    />

    <button
      v-if="sketch?.has_photo"
      type="button"
      class="absolute top-4 right-4 z-40 flex items-center gap-1.5 px-3 py-1.5 bg-secondary-950 border border-secondary-700 hover:bg-secondary-800 text-grey-100 font-heading font-bold text-sm transition-colors"
      title="Originele foto bekijken"
      @click="photoOpen = true"
    >
      <ImageIcon :size="15" />
      <span>Originele foto</span>
    </button>

    <SketchPhotoModal
      v-if="photoOpen"
      :src="photoSrc"
      @close="photoOpen = false"
    />

  </div>
</template>