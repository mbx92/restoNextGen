export default defineNuxtRouteMiddleware(async (to) => {
  // Check if user is authenticated
  const { data: session } = await useFetch('/api/admin/auth/session')

  // If not authenticated and not going to login page, redirect to login
  if (!session.value?.user && to.path !== '/admin/login') {
    return navigateTo('/admin/login')
  }

  // If authenticated and trying to access login page, redirect to dashboard
  if (session.value?.user && to.path === '/admin/login') {
    return navigateTo('/admin')
  }
})
