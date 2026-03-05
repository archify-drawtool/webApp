<template>
  <div class="app-layout">

    <header>
      <nav>
        <NuxtLink to="/">MyApp</NuxtLink>
        <NuxtLink to="/health">API Health</NuxtLink>
      </nav>
    </header>

    <main>
      <slot />
    </main>

    <footer>
      <p>Wat een mooie footer</p>
    </footer>

  </div>
</template>