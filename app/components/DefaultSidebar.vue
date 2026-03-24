<script setup lang="ts">
import { FolderOpen, FolderLock, PencilLine, ChevronLeft } from 'lucide-vue-next'

const { isCollapsed, toggle } = useSidebar()
const route = useRoute()
</script>

<template>
  <aside :class="['fixed h-screen bg-[var(--color-secondary-950)] text-white flex flex-col gap-5 transition-all duration-300 overflow-hidden', isCollapsed ? 'w-12 py-5 px-2' : 'w-60 py-5 px-5']">

    <!-- Logo -->
    <NuxtLink to="/">
      <div class="flex items-center overflow-hidden">
        <img v-if="!isCollapsed" src="/images/cbyte-logo.png" alt="CBYTE digital" class="h-8" >
        <img v-if="isCollapsed" src="/images/cbyte-logo-sm.jpg" alt="CB" class="h-8" >
      </div>
    </NuxtLink>

    <!-- Navigatie -->
    <nav class="flex flex-col gap-4 flex-1">
      <LogoutButton />

      <!-- Start sketching -->
      <NuxtLink to="/schetsen" class="btn-wrapper" :class="{ 'btn-wrapper--hidden': isCollapsed }" :tabindex="isCollapsed ? -1 : 0">
        <PrimaryButton tabindex="-1">Begin met schetsen</PrimaryButton>
      </NuxtLink>

      <NuxtLink v-if="isCollapsed" to="/schetsen" class="flex justify-center">
        <PencilLine :size="20" class="shrink-0 h-6 w-6" :color="route.path === '/schetsen' ? 'var(--color-primary-500)' : 'white'" />
      </NuxtLink>

      <!-- Links -->
      <NuxtLink to="/projecten" :class="['sidebar-link', { 'justify-center w-full' : isCollapsed }]">
        <FolderOpen v-if="isCollapsed" :size="20" class="shrink-0 h-6 w-6" :color="route.path === '/projecten' ? 'var(--color-primary-500)' : 'white'"/>
        <span v-if="!isCollapsed">Projecten<span class="text-[var(--color-primary-500)]">.</span></span>
      </NuxtLink>

      <NuxtLink to="/mijn-schetsen" :class="['sidebar-link', { 'justify-center w-full' : isCollapsed }]">
        <FolderLock v-if="isCollapsed" :size="20" class="shrink-0 h-6 w-6" :color="route.path === '/mijn-schetsen' ? 'var(--color-primary-500)' : 'white'"/>
        <span v-if="!isCollapsed">Mijn Schetsen<span class="text-[var(--color-primary-500)]">.</span></span>
      </NuxtLink>

    </nav>

    <!-- Toggle button -->
    <button :class="['flex items-center gap-2 cursor-pointer text-white', { 'justify-center w-full' : isCollapsed }]" @click="toggle">
      <ChevronLeft :size="24" class="toggle-icon" :class="{ 'toggle-icon--collapsed': isCollapsed }" />
      <span v-if="!isCollapsed" class="text-small">Inklappen</span>
    </button>

  </aside>
</template>

<style scoped>
.sidebar-link {
  font-family: var(--font-heading);
  font-size: var(--text-h2);
  font-weight: 700;
  color: white;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
}

.sidebar-link:hover {
  text-decoration: underline;
  text-decoration-color: var(--color-primary-500);
}

.sidebar-link.router-link-exact-active span {
  text-decoration: underline;
  text-decoration-color: var(--color-primary-500);
}

.btn-wrapper {
  overflow: hidden;
  max-height: 60px;
  opacity: 1;
  transition: max-height 0.3s ease, opacity 0.2s ease;
}

.btn-wrapper--hidden {
  max-height: 0;
  opacity: 0;
  pointer-events: none;
}

.toggle-icon {
  transition: transform 0.3s ease;
}

.toggle-icon--collapsed {
  transform: rotate(180deg);
}

</style>