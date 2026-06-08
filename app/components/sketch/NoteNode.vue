<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

const props = defineProps<NodeProps<{ label?: string }>>()
defineEmits(['updateNodeInternals'])

const { openMenu } = useNodeContextMenu()

const inputRef = ref<HTMLTextAreaElement | null>(null)

function autoResize() {
  const el = inputRef.value
  if (!el) return
  el.style.height = 'auto'
  el.style.height = el.scrollHeight + 'px'
}

const { editing, editValue, startEdit, confirmEdit, cancelEdit } = useNodeLabelEditing(
  props.id,
  () => props.data.label,
  inputRef,
  () => {
    inputRef.value?.select()
    autoResize()
  },
)

function onContextMenu(event: MouseEvent) {
  openMenu(props.id, props.type, event.clientX, event.clientY)
}
</script>

<template>
  <Handle id="top-target" type="target" :position="Position.Top" />
  <Handle id="top-source" type="source" :position="Position.Top" />
  <Handle id="right-target" type="target" :position="Position.Right" />
  <Handle id="right-source" type="source" :position="Position.Right" />
  <Handle id="bottom-target" type="target" :position="Position.Bottom" />
  <Handle id="bottom-source" type="source" :position="Position.Bottom" />
  <Handle id="left-target" type="target" :position="Position.Left" />
  <Handle id="left-source" type="source" :position="Position.Left" />

  <div class="note-wrapper" :class="{ 'is-selected': selected }" @dblclick.stop="startEdit" @contextmenu.prevent.stop="onContextMenu">
    <!-- Het gele notitieblok met afgesneden hoek -->
    <div class="note-body">
      <textarea
        v-if="editing"
        ref="inputRef"
        v-model="editValue"
        class="note-textarea"
        rows="1"
        @input="autoResize"
        @keydown.enter.exact="confirmEdit"
        @keydown.escape="cancelEdit"
        @blur="confirmEdit"
        @click.stop
        @mousedown.stop
        @dblclick.stop
      />
      <span v-else class="note-text">{{ data.label || 'Notitie' }}</span>
    </div>
    <!-- Driehoekje buiten clip-path, zodat het volledig zichtbaar is -->
    <div class="note-corner" />
  </div>
</template>

<style scoped>
/* Buitenste wrapper: vaste breedte zodat selectie niet krimpt */
.note-wrapper {
  position: relative;
  width: 180px;
  cursor: default;
  margin: 8px;
  border-radius: 4px;
}

.note-wrapper.is-selected::before {
  content: '';
  position: absolute;
  inset: -8px;
  background-color: var(--color-primary-500);
  opacity: 0.15;
  border-radius: 8px;
  pointer-events: none;
  z-index: -1;
}

/* Het gele blok met afgesneden rechterbovenhoek */
.note-body {
  width: 100%;
  min-height: 60px;
  background-color: #fef08a; /* yellow-200 */
  border: 1px solid #facc15; /* yellow-400 */
  border-radius: 2px;
  padding: 10px 12px 18px 12px;
  box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.15);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
  box-sizing: border-box;
}

.note-text {
  display: block;
  font-size: 12px;
  color: #713f12; /* yellow-900 */
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  min-height: 40px;
}

.note-textarea {
  display: block;
  width: 100%;
  font-size: 12px;
  color: #713f12;
  background: transparent;
  border: none;
  outline: none;
  resize: none;
  overflow: hidden;
  line-height: 1.4;
  font-family: inherit;
  padding: 0;
  margin: 0;
  min-height: 40px;
}

/* Gevuld driehoekje in de afgesneden rechterbovenhoek */
.note-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  /* Driehoek: breedte 16px, hoogte 16px, puntje linksonder */
  border-width: 16px 0 0 16px;
  border-color: transparent transparent transparent #a16207; /* yellow-700 */
}

:deep(.vue-flow__handle) {
  width: 6px;
  height: 6px;
  background-color: #E5097F;
  border: 1px solid white;
  border-radius: 50%;
  opacity: 1;
}

:deep(.vue-flow__handle)::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 50%;
  width: 26px;
  height: 26px;
  transform: translate(-50%, -50%);
  background: transparent;
}
</style>

<style>
.vue-flow__node-note.selected::after {
  display: none;
}
</style>

