<script setup lang="ts">
import { ArrowRight, ArrowLeft } from 'lucide-vue-next'

const props = defineProps<{
  edgeId: string
  hasMarkerEnd: boolean
  hasMarkerStart: boolean
  isDashed: boolean
  x: number
  y: number
}>()

const emit = defineEmits<{
  close: []
}>()

const { updateEdgePropertiesWithHistory } = useSketchCanvas()

const menuRef = ref<HTMLElement | null>(null)
const adjustedX = ref(props.x)
const adjustedY = ref(props.y)

onMounted(() => {
  if (!menuRef.value) return
  const rect = menuRef.value.getBoundingClientRect()
  if (rect.right > window.innerWidth) adjustedX.value = props.x - rect.width
  if (rect.bottom > window.innerHeight) adjustedY.value = props.y - rect.height
})

function toggleMarkerStart() {
  updateEdgePropertiesWithHistory(props.edgeId, { markerStart: !props.hasMarkerStart })
  emit('close')
}

function toggleMarkerEnd() {
  updateEdgePropertiesWithHistory(props.edgeId, { markerEnd: !props.hasMarkerEnd })
  emit('close')
}

function toggleDashed() {
  updateEdgePropertiesWithHistory(props.edgeId, { dashed: !props.isDashed })
  emit('close')
}
</script>

<template>
  <Teleport to="body">
    <div
      class="fixed inset-0 z-[1000]"
      @mousedown="emit('close')"
      @contextmenu.prevent="emit('close')"
    />
    <div
      ref="menuRef"
      class="fixed z-[1001] rounded-xl bg-secondary-950 shadow-lg p-1 min-w-44"
      :style="{ top: `${adjustedY}px`, left: `${adjustedX}px` }"
      @mousedown.stop
    >
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-grey-100 hover:bg-primary-500 hover:text-white transition-colors"
        @click.stop="toggleMarkerStart"
      >
        <span class="w-3 text-xs">{{ hasMarkerStart ? '✓' : '' }}</span>
        <ArrowLeft :size="16" />
        <span class="text-sm">Pijl bij bron</span>
      </button>
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-grey-100 hover:bg-primary-500 hover:text-white transition-colors"
        @click.stop="toggleMarkerEnd"
      >
        <span class="w-3 text-xs">{{ hasMarkerEnd ? '✓' : '' }}</span>
        <ArrowRight :size="16" />
        <span class="text-sm">Pijl bij doel</span>
      </button>
      <div class="border-t border-secondary-800 my-1" />
      <button
        class="flex items-center gap-2 px-3 py-2 rounded-lg w-full text-grey-100 hover:bg-primary-500 hover:text-white transition-colors"
        @click.stop="toggleDashed"
      >
        <span class="w-3 text-xs">{{ isDashed ? '✓' : '' }}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <line x1="1" y1="8" x2="5" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <line x1="7" y1="8" x2="11" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
          <line x1="13" y1="8" x2="15" y2="8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" />
        </svg>
        <span class="text-sm">Stippellijn</span>
      </button>
    </div>
  </Teleport>
</template>
