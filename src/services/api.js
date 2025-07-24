import axios from 'axios';
import authStore from '../store/authStore.js';

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
    failedQueue.forEach(prom => {
        if (error) {
            prom.reject(error);
        } else {
            prom.resolve(token);
        }
    });
    failedQueue = [];
};

const api = axios.create({
    baseURL: '', // Will be set dynamically
});

api.interceptors.request.use(config => {
    const token = authStore.token;
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

let refreshTokenBaseURL = '';

api.interceptors.response.use(response => {
    return response;
}, async error => {
    const originalRequest = error.config;

    // Если это не 401 ошибка, отклоняем ее
    if (error.response.status !== 401) {
        return Promise.reject(error);
    }

    // *** ЭТА СТРОКА ПРЕДОТВРАЩАЕТ ПОВТОРНЫЙ РЕФРЕШ ДЛЯ ОДНОГО И ТОГО ЖЕ ЗАПРОСА ***
    // Если запрос уже был помечен как "повторный" (т.е. уже была попытка рефреша для него),
    // то просто отклоняем ошибку, чтобы не попасть в бесконечный цикл.
    if (originalRequest._retry) {
        console.log('Request already tried to refresh, rejecting to prevent infinite loop.');
        return Promise.reject(error);
    }

    // Если нет токена обновления, или мы уже обновляем токен, добавляем запрос в очередь
    if (!authStore.refreshToken || isRefreshing) {
        return new Promise(function(resolve, reject) {
            failedQueue.push({ resolve, reject });
        })
        .then(token => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
        })
        .catch(err => {
            return Promise.reject(err);
        });
    }

    // Устанавливаем флаг, что мы начали процесс обновления
    originalRequest._retry = true;
    isRefreshing = true;

    try {
        console.log('Attempting to refresh token...');
        const oldRefreshToken = authStore.refreshToken;
        console.log('Old Refresh Token:', oldRefreshToken);

        const response = await axios.post(`${refreshTokenBaseURL}/auth/refresh`, {
            refresh_token: oldRefreshToken
        });

        const { access_token, refresh_token } = response.data;
        console.log('Token refreshed:', access_token ? 'New Access Token received' : 'No new Access Token', refresh_token ? 'New Refresh Token received' : 'No new Refresh Token');
        console.log('Old Access Token:', authStore.token);
        console.log('New Access Token:', access_token);
        console.log('Old Refresh Token:', oldRefreshToken);
        console.log('New Refresh Token:', refresh_token);

        authStore.setTokens(access_token, refresh_token);
        processQueue(null, access_token); // Разрешаем все запросы в очереди с новым токеном

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest); // Повторяем исходный запрос

    } catch (refreshError) {
        console.error('Failed to refresh token, logging out:', refreshError);
        processQueue(refreshError); // Отклоняем все запросы в очереди с ошибкой
        authStore.logout();
        window.location.href = '/login'; // Перенаправляем на страницу входа
        return Promise.reject(refreshError);
    } finally {
        isRefreshing = false; // Сбрасываем флаг обновления
    }
});

export const setApiBaseURL = (url) => {
    api.defaults.baseURL = url;
    console.log('API Base URL set to:', url);
};

export const setRefreshTokenBaseURL = (url) => {
    refreshTokenBaseURL = url;
    console.log('Refresh Token Base URL set to:', url);
};

export default api;