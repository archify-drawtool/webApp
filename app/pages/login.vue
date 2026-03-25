<template>
  <div class="w-full max-w-sm flex flex-col items-center gap-8">
    <img src="/images/cbyte-logo.png" alt="CBYTE Digital" class="h-12" >

    <div class="w-full flex flex-col gap-6">
      <h1 class="text-center">Login op Archify</h1>

      <p v-if="error" class="text-small px-4 py-2 bg-error-bg text-error-text">
        {{ errorMessage }}
      </p>

      <form class="flex flex-col gap-4" @submit.prevent="submit">
        <AuthInput
          id="email"
          v-model="credentials.email"
          label="E-mailadres"
          type="email"
          required
        />

        <AuthInput
          id="password"
          v-model="credentials.password"
          label="Wachtwoord"
          type="password"
          required
        >
          <template #right-label>
            <a href="#" class="text-small text-primary-500 hover:text-primary-900"
              >Wachtwoord vergeten?</a
            >
          </template>
        </AuthInput>

        <PrimaryButton type="submit" :disabled="pending" class="w-full mt-2">
          {{ pending ? "Bezig..." : "Inloggen" }}
        </PrimaryButton>
      </form>

      <p class="text-small text-center text-white/70">
        Nog geen account?
        <a
          href="mailto:team@cbyte.nl"
          class="text-primary-500 hover:text-primary-900"
          >Neem contact op</a
        >
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { LoginCredentials } from "~/types/Auth";

definePageMeta({ layout: "auth" });

const { login } = useAuth();

const credentials = ref<LoginCredentials>({ email: "", password: "" });
const pending = ref(false);
const error = ref<Error | null>(null);

const errorMessage = computed(() => error.value?.message || "Onbekende fout");

const submit = async () => {
  pending.value = true;
  error.value = null;
  try {
    await login(credentials.value);
    await navigateTo("/");
  } catch (err) {
    error.value = err as Error;
  } finally {
    pending.value = false;
  }
};
</script>
