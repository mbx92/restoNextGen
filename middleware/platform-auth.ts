export default defineNuxtRouteMiddleware(async (to) => {
  // Skip for login page
  if (to.path === "/platform/login") {
    return;
  }

  // Check session
  const { data: session } = await useFetch("/api/platform/auth/session");

  if (!session.value?.user) {
    return navigateTo("/platform/login");
  }
});
