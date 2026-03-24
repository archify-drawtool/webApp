<template>
  <div>
    <template v-if="isLoggedIn">
      <span>{{ user?.name }}</span>
      <PrimaryButton :disabled="pending" @click="handleLogout">
        {{ pending ? "Bezig..." : "Uitloggen" }}
      </PrimaryButton>
    </template>
    <template v-else>
      <NuxtLink to="/login">Inloggen</NuxtLink>
    </template>
  </div>
</template>

<script setup lang="ts">
const { logout, user, isLoggedIn } = useAuth();

const pending = ref(false);
const error = ref<Error | null>(null);

const handleLogout = async () => {
  pending.value = true;
  error.value = null;
  try {
    await logout();
    await navigateTo("/login");
  } catch (err) {
    error.value = err as Error;
  } finally {
    pending.value = false;
  }
};
</script>
