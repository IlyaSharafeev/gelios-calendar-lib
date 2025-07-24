import axios from 'axios'
import authStore from "../store/authStore.js";

// Инициализируем Axios без baseURL или с временным значением.
// baseURL будет установлен динамически из родительского окна.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL_BACKEND || '/', // Используем VITE_API_URL как запасной вариант или '/'
  withCredentials: true,
})

let isRefreshing = false
let subscribers = []

// Функция для динамической установки baseURL
export const setApiBaseURL = (url) => {
  api.defaults.baseURL = url;
  console.log('API baseURL updated to:', api.defaults.baseURL);
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

          try {
            // Attempt to refresh the token using the refresh token from localStorage
            // Убедитесь, что baseURL используется для запроса обновления токена
            const { data } = await axios.post(`${api.defaults.baseURL}/auth/refresh-token`, {
              refresh: localStorage.getItem('refreshToken'),
            })

            // Update the token in the auth store and localStorage
            authStore.token = data.access // Обновляем access token в authStore
            authStore.refreshToken = data.refresh // Обновляем refresh token в authStore
            localStorage.setItem('token', data.access) // Обновляем access token в localStorage
            localStorage.setItem('refreshToken', data.refresh) // Обновляем refresh token в localStorage

            // Notify all subscribers that the token has been refreshed
            onRefreshed(data.access)
            isRefreshing = false

            // Retry the original request with the new token
            // Убедимся, что Authorization заголовок обновлен для originalRequest
            originalRequest.headers.Authorization = `Bearer ${data.access}`
            return api(originalRequest)
          } catch (err) {
            // If refresh fails, log the user out and redirect to login page
            isRefreshing = false
            authStore.logout() // Ensure logout logic is correct in your store
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