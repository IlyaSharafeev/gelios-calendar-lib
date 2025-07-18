import axios from 'axios'
import { useAuthStore } from '@/stores/auth' // Ensure this is correctly imported from your store

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
})

let isRefreshing = false
let subscribers = []

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
          const { data } = await axios.post(`${import.meta.env.VITE_API_URL}/token/refresh`, {
            refresh: localStorage.getItem('refreshToken'),
          })

          // Update the token in the auth store and localStorage
          authStore.token = data.access
          localStorage.setItem('token', data.access)
          localStorage.setItem('refreshToken', data.refresh)

          // Notify all subscribers that the token has been refreshed
          onRefreshed(data.access)
          isRefreshing = false

          // Retry the original request with the new token
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
