import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import authStore from './authStore.js'; // Импортируем существующий стор аутентификации

// Создаем отдельный экземпляр axios для API преподавателя
const teacherApi = axios.create({
    baseURL: 'https://gelios-teacher.ddns.net/api'
});

// Добавляем перехватчик (interceptor) для автоматического добавления токена авторизации
teacherApi.interceptors.request.use(config => {
    // Получаем токен из authStore
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});


export const useTeacherScheduleStore = defineStore('teacherSchedule', () => {
    const schedule = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    /**
     * Получение расписания учителя с бэкенда.
     * @param {object} params - Параметры для запроса (например, start_date, end_date).
     */
    async function fetchTeacherSchedule(params) {
        isLoading.value = true;
        error.value = null;
        try {
            // Используем созданный экземпляр teacherApi
            const response = await teacherApi.get('/teacher/schedule', { params });
            schedule.value = response.data || [];
        } catch (err) {
            console.error('Error fetching teacher schedule:', err);
            error.value = err;
            schedule.value = []; // Очищаем расписание в случае ошибки
        } finally {
            isLoading.value = false;
        }
    }

    return { schedule, isLoading, error, fetchTeacherSchedule };
});