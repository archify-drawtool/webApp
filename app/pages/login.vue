<template>
  <div>
    <h1>Inloggen</h1>

    <form @submit.prevent="submit">
      <div>
        <label for="email">E-mailadres</label>
        <input
          id="email"
          v-model="credentials.email"
          class="border"
          type="email"
          required
        >
      </div>

      <div>
        <label for="password">Wachtwoord</label>
        <input
          id="password"
          v-model="credentials.password"
          class="border"
          type="password"
          required
        >
      </div>

      <PrimaryButton type="submit" :disabled="pending">
        {{ pending ? "Bezig..." : "Inloggen" }}
      </PrimaryButton>
    </form>

    <p v-if="error">Fout: {{ errorMessage }}</p>
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
