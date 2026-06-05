<template>
  <div class="w-full max-w-sm flex flex-col items-center gap-8">
    <img src="/images/cbyte-logo.png" alt="CBYTE Digital" class="h-12" >

    <div class="w-full flex flex-col gap-6">
      <h1 class="text-center">Login op Archify</h1>

      <p v-if="error" class="text-small px-4 py-2 bg-error-bg text-error-text">
        {{ errorMessage }}
      </p>

      <PrimaryButton :disabled="pending" class="w-full flex items-center justify-center gap-3" @click="handleLogin">
        <svg v-if="!pending" class="w-5 h-5" viewBox="0 0 21 21" xmlns="http://www.w3.org/2000/svg">
          <rect x="1" y="1" width="9" height="9" fill="#f25022"/>
          <rect x="11" y="1" width="9" height="9" fill="#7fba00"/>
          <rect x="1" y="11" width="9" height="9" fill="#00a4ef"/>
          <rect x="11" y="11" width="9" height="9" fill="#ffb900"/>
        </svg>
        {{ pending ? "Bezig met inloggen..." : "Inloggen met Microsoft" }}
      </PrimaryButton>

      <p class="text-small text-center text-white/70">
        Geen toegang?
        <a
          href="mailto:team@cbyte.nl"
          class="font-bold text-primary-500 hover:text-primary-900"
        >Neem contact op</a>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
definePageMeta({ layout: "auth" });

const { loginWithMicrosoft } = useAuth();

const pending = ref(false);
const error = ref<Error | null>(null);

const errorMessage = computed(() => error.value?.message || "Inloggen mislukt");

const handleLogin = async () => {
  pending.value = true;
  error.value = null;
  try {
    await loginWithMicrosoft();
  } catch (err) {
    error.value = err as Error;
  } finally {
    pending.value = false;
  }
};
</script>
