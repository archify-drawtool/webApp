const PUBLIC_ROUTES = ["/login"];

export default defineNuxtRouteMiddleware(async (to) => {
  if (PUBLIC_ROUTES.includes(to.path)) return;

  const { isLoggedIn, user, fetchCurrentUser } = useAuth();

  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }

  if (!user.value) {
    await fetchCurrentUser();
  }
});
