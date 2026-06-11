const PUBLIC_ROUTES = ["/login", "/privacy-policy"]
const PUBLIC_PREFIXES = ["/gedeeld/"]

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_ROUTES.includes(to.path)) return
  if (PUBLIC_PREFIXES.some(prefix => to.path.startsWith(prefix))) return

  const { isLoggedIn, user, fetchCurrentUser } = useAuth();

  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }

  if (!user.value && import.meta.client) {
    await fetchCurrentUser();
  }
});
