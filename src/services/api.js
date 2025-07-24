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
  console.log('Refresh Token API baseURL updated to:', refreshTokenBaseURL);
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

      if (
          error.response?.status === 401 &&
          !originalRequest._retry &&
          localStorage.getItem('refreshToken')
      ) {
        originalRequest._retry = true

        if (!isRefreshing) {
          isRefreshing = true

          const oldAccessToken = authStore.token;
          const oldRefreshToken = localStorage.getItem('refreshToken');

          try {
            const { data } = await axios.post(`${refreshTokenBaseURL}/auth/refresh`, {
              refresh_token: oldRefreshToken,
            })

            authStore.setTokens(data.access_token, data.refresh_token);

            console.log('Token refreshed:');
            console.log('  Old Access Token:', oldAccessToken || 'N/A');
            console.log('  New Access Token:', data.access_token || 'N/A');
            console.log('  Old Refresh Token:', oldRefreshToken || 'N/A');
            console.log('  New Refresh Token:', data.refresh_token || 'N/A');

            onRefreshed(data.access_token)
            isRefreshing = false

            originalRequest.headers.Authorization = `Bearer ${data.access_token}`
            return api(originalRequest)
          } catch (err) {
            isRefreshing = false
            authStore.logout()
            console.error('Failed to refresh token, logging out:', err);
            window.location.href = '/login'
            return Promise.reject(err)
          }
        }

        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`
            resolve(api(originalRequest))
          })
        })
      }

      return Promise.reject(error)
    },
)

export default api