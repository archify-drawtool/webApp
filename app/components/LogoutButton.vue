<template>
  <PrimaryButton :disabled="pending" @click="handleLogout">
    {{ pending ? "Bezig..." : "Uitloggen" }}
  </PrimaryButton>
  <p v-if="error" class="text-red-500 text-sm">{{ error }}</p>
</template>

<script setup lang="ts">
const { logout } = useAuth();

const pending = ref(false);
const error = ref<string | null>(null);

const handleLogout = async () => {
  pending.value = true;
  error.value = null;
  try {
    await logout();
    await navigateTo("/login");
  } catch {
    error.value = "Uitloggen mislukt. Probeer opnieuw.";
  } finally {
    pending.value = false;
  }
};
</script>
