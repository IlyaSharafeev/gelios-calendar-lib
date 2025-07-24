import axios from 'axios'
import authStore from "../store/authStore.js";

const api = axios.create({
  baseURL: "https://gelios-teacher.ddns.net/api",
  withCredentials: true,
})

let refreshTokenBaseURL = "https://gelios-teacher.ddns.net/api";

let isRefreshing = false
let subscribers = []

export const setApiBaseURL = (url) => {
  api.defaults.baseURL = url;
  console.log('API baseURL updated to:', api.defaults.baseURL);
}

export const setRefreshTokenBaseURL = (url) => {
  refreshTokenBaseURL = url;
  console.log('Refresh Token API baseURL updated to:', refreshTokenBaseTokenBaseURL);
}

const subscribeTokenRefresh = (callback) => {
  subscribers.push(callback)
}

const onRefreshed = (newToken) => {
  subscribers.forEach((callback) => callback(newToken))
  subscribers = []
}

api.interceptors.request.use((config) => {
  const token = authStore.token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config
})

api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config

      // If the error is 401 and it's not a retry AND a refresh token exists
      if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem('refreshToken')
      ) {
        originalRequest._retry = true // Mark the original request as retried

        if (!isRefreshing) {
          isRefreshing = true

          const oldAccessToken = authStore.token;
          const oldRefreshToken = localStorage.getItem('refreshToken');

          try {
            // Create a new Axios instance *without* the interceptor for the refresh request itself
            // This prevents the refresh request from recursively trying to refresh
            const refreshInstance = axios.create({
              baseURL: refreshTokenBaseURL,
              withCredentials: true,
            });

            const { data } = await refreshInstance.post('/auth/refresh', { // Use refreshInstance
              refresh_token: oldRefreshToken,
            });

            authStore.setTokens(data.access_token, data.refresh_token);

            console.log('Token refreshed:');
            console.log('  Old Access Token:', oldAccessToken || 'N/A');
            console.log('  New Access Token:', data.access_token || 'N/A');
            console.log('  Old Refresh Token:', oldRefreshToken || 'N/A');
            console.log('  New Refresh Token:', data.refresh_token || 'N/A');

            onRefreshed(data.access_token)
            isRefreshing = false

            originalRequest.headers.Authorization = `Bearer ${data.access_token}`
            return api(originalRequest) // Retry the original request with the new token
          } catch (err) {
            isRefreshing = false
            authStore.logout()
            console.error('Failed to refresh token, logging out:', err);
            window.location.href = '/login'
            return Promise.reject(err)
          }
        }

        // If a refresh is already in progress, queue the original request
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      // If it's not a 401 or it's a 401 but already retried, or no refresh token, reject the error
      return Promise.reject(error)
    },
)

export default api