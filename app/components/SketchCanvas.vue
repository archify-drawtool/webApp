<script setup lang="ts">
import { VueFlow } from '@vue-flow/core'
import { Background, BackgroundVariant } from '@vue-flow/background'
import { Controls } from '@vue-flow/controls'
</script>

<template>
  <VueFlow
    id="sketch-canvas"
    class="w-full h-full"
    :default-viewport="{ zoom: 1 }"
    :min-zoom="0.1"
    :max-zoom="4"
  >
    <Background
      :variant="BackgroundVariant.Dots"
      :gap="20"
      :size="1.5"
      pattern-color="#4b5563"
      bg-color="transparent"
    />
    <Controls :show-interactive="false" />
  </VueFlow>
</template>
