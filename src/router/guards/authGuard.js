import type { NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { getCookie } from '@/utils/cookies'

export async function authGuard(
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext,
) {
  const store = useAuthStore()

  const accessToken = getCookie('geliosAccessToken')
  const refreshToken = getCookie('geliosRefreshToken')

  console.log('--- Auth Guard Navigation ---');
  console.log('Navigating TO:', to.path, 'with meta:', to.meta);
  console.log('Navigating FROM:', from.path);

  // Пропуск, якщо змінився лише query
  if (to.path === from.path && JSON.stringify(to.query) !== JSON.stringify(from.query)) {
    console.log('Skipping auth guard: Only query parameters changed.');
    return next()
  }

  // If access token is missing but refresh token exists, try to refresh
  if (!accessToken && refreshToken) {
    console.log('No access token, but refresh token found. Attempting to refresh token...');
    try {
      await store.refreshToken(refreshToken)
      console.log('Token refreshed successfully.');
    } catch (err) {
      console.log('Failed to refresh token. Redirecting to /login.');
      return next('/login')
    }
  }

  const isAuthenticated = !!getCookie('geliosAccessToken') || !!localStorage.getItem('token'); // Check localStorage as well
  console.log('Is Authenticated:', isAuthenticated);

  // Якщо користувач уже авторизований, редірект з /login на /profile
  if (to.path === '/login' && isAuthenticated) {
    console.log('User is authenticated and trying to access /login. Redirecting to /profile.');
    return next('/profile')
  }

  // Доступ до публічних сторінок
  if (!to.meta.auth) {
    console.log('Page does not require authentication (public page). Allowing access.');
    return next()
  }

  // Якщо не авторизований
  if (!isAuthenticated) {
    console.log('User is not authenticated and trying to access a protected page. Redirecting to /login.');
    return next('/login')
  }

  // Якщо потрібно право доступу, але його нема
  if (to.meta.permission && !store.hasPermission(to.meta.permission)) {
    console.log(`User is authenticated but lacks required permission: ${String(to.meta.permission)}. Redirecting to /profile.`);
    return next('/profile')
  }

  // Якщо це корінь, перекидаємо на /profile
  if (to.path === '/') {
    console.log('Navigating to root path (/). Redirecting to /profile.');
    return next('/profile')
  }

  console.log('All checks passed. Allowing navigation.');
  return next()
}
