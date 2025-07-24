import axios from 'axios'
import authStore from "../store/authStore.js";

// Инициализируем Axios без baseURL или с временным значением.
// baseURL будет установлен динамически из родительского окна.
const api = axios.create({
  baseURL: "https://gelios-teacher.ddns.net/api", // Используем VITE_API_URL как запасной вариант или '/'
  withCredentials: true,
})

// Новая переменная для отдельного baseURL для refresh токена
let refreshTokenBaseURL = "https://gelios-teacher.ddns.net/api"; // Задайте здесь дефолтное значение, если нужно

let isRefreshing = false
let subscribers = []

// Функция для динамической установки основного baseURL
export const setApiBaseURL = (url) => {
  api.defaults.baseURL = url;
  console.log('API baseURL updated to:', api.defaults.baseURL);
}

// Новая функция для динамической установки baseURL для refresh токена
export const setRefreshTokenBaseURL = (url) => {
  // Исправлено: теперь присваиваем переданное значение, а не захардкоженное
  refreshTokenBaseURL = url;
  console.log('Refresh Token API baseURL updated to:', refreshTokenBaseURL);
}

// Function to subscribe to the token refresh event
const subscribeTokenRefresh = (callback) => {
  subscribers.push(callback)
}

// Function to notify all subscribers with the new token
const onRefreshed = (newToken) => {
  subscribers.forEach((callback) => callback(newToken))
  subscribers = [] // Clear subscribers after notifying them
}

// Request interceptor to add the Authorization header if the token is present
api.interceptors.request.use((config) => {
  const token = authStore.token; // Получаем access token из authStore
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config // Return the config for the request
})

// Response interceptor to handle 401 and refresh the token
api.interceptors.response.use(
    (response) => response, // On success, simply return the response
    async (error) => {
      const originalRequest = error.config // The original request that failed

      // If the error is a 401 and the refresh token exists
      if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem('refreshToken')
      ) {
        originalRequest._retry = true

        if (!isRefreshing) {
          isRefreshing = true

          // Сохраняем старый токен для логирования
          const oldAccessToken = authStore.token;

          try {
            // !!! ИСПОЛЬЗУЕМ ОТДЕЛЬНЫЙ refreshTokenBaseURL ДЛЯ ЗАПРОСА ОБНОВЛЕНИЯ ТОКЕНА !!!
            const { data } = await axios.post(`${refreshTokenBaseURL}/auth/refresh`, {
              refresh_token: localStorage.getItem('refreshToken'),
            })

            // Update the token in the auth store and localStorage
            authStore.setTokens(data.access_token, data.refresh_token); // Используем метод setTokens из authStore

            // Логируем старый и новый токены
            console.log('Token refreshed:');
            console.log('  Old Access Token:', oldAccessToken ? oldAccessToken.substring(0, 10) + '...' : 'N/A'); // Обрезаем для читаемости
            console.log('  New Access Token:', data.access_token ? data.access_token.substring(0, 10) + '...' : 'N/A'); // Обрезаем для читаемости
            console.log('  Old Refresh Token:', localStorage.getItem('refreshToken') ? localStorage.getItem('refreshToken').substring(0, 10) + '...' : 'N/A'); // Если вы хотите логировать и старый рефреш
            console.log('  New Refresh Token:', data.refresh_token ? data.refresh_token.substring(0, 10) + '...' : 'N/A'); // Если вы хотите логировать и новый рефреш

            // Notify all subscribers that the token has been refreshed
            onRefreshed(data.access_token) // Передаем access_token, а не data.access
            isRefreshing = false

            // Retry the original request with the new token
            // Убедимся, что Authorization заголовок обновлен для originalRequest
            originalRequest.headers.Authorization = `Bearer ${data.access_token}`
            return api(originalRequest)
          } catch (err) {
            // If refresh fails, log the user out and redirect to login page
            isRefreshing = false
            authStore.logout() // Ensure logout logic is correct in your store
            // Осторожно с window.location.href = '/login' - это может сломать SPA
            // Лучше использовать router.push('/login') если есть доступ к роутеру
            console.error('Failed to refresh token, logging out:', err);
            window.location.href = '/login' // Redirect to login page
            return Promise.reject(err)
          }
        }

        // If another request is already refreshing the token, queue this request until it finishes
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest)) // Retry the original request with the new token
          })
        })
      }

      // For any other errors, simply reject the promise
      return Promise.reject(error)
    },
)

export default api