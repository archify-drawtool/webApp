<script setup lang="ts">
</script>
<template>
  <div class="app-layout">

    <div class="flex">
      <DefaultSidebar />
      <main class="p-5">
        <slot />
      </main>
    </div>


<!--    <header>-->
<!--      <nav>-->
<!--        <NuxtLink to="/">MyApp</NuxtLink>-->
<!--        <NuxtLink to="/health">API Health</NuxtLink>-->
<!--      </nav>-->
<!--    </header>-->
  </div>
</template>