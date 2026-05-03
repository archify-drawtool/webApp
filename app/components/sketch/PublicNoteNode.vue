<script setup lang="ts">
import { Handle, Position, type NodeProps } from '@vue-flow/core'

defineProps<NodeProps<{ label?: string }>>()
defineEmits(['updateNodeInternals'])
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

  <div class="note-wrapper">
    <div class="note-body">
      <span class="note-text">{{ data.label || 'Notitie' }}</span>
    </div>
    <div class="note-corner" />
  </div>
</template>

<style scoped>
.note-wrapper {
  position: relative;
  width: 180px;
  cursor: default;
}

.note-body {
  width: 100%;
  min-height: 60px;
  background-color: #fef08a;
  border: 1px solid #facc15;
  border-radius: 2px;
  padding: 10px 12px 18px 12px;
  box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.15);
  clip-path: polygon(0 0, calc(100% - 16px) 0, 100% 16px, 100% 100%, 0 100%);
  box-sizing: border-box;
}

.note-text {
  display: block;
  font-size: 12px;
  color: #713f12;
  white-space: pre-wrap;
  word-break: break-word;
  line-height: 1.4;
  min-height: 40px;
}

.note-corner {
  position: absolute;
  top: 0;
  right: 0;
  width: 0;
  height: 0;
  border-style: solid;
  border-width: 16px 0 0 16px;
  border-color: transparent transparent transparent #a16207;
}

:deep(.vue-flow__handle) {
  width: 10px;
  height: 10px;
  background-color: #E5097F;
  border: 2px solid white;
  border-radius: 50%;
  opacity: 1;
}
</style>
