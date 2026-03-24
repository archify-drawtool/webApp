const PUBLIC_ROUTES = ["/login"];

export default defineNuxtRouteMiddleware((to) => {
  if (PUBLIC_ROUTES.includes(to.path)) return;

  const { isLoggedIn } = useAuth();

  if (!isLoggedIn.value) {
    return navigateTo("/login");
  }
});
