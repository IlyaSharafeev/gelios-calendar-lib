// src/store/studentScheduleStore.js
import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import authStore from './authStore.js';
import {format} from "date-fns";

// Создаем отдельный экземпляр axios для API студента
const studentApi = axios.create({
    baseURL: 'https://gelios-teacher.ddns.net/api'
});

// Добавляем перехватчик для автоматического добавления токена авторизации
studentApi.interceptors.request.use(config => {
    if (authStore.token) {
        config.headers.Authorization = `Bearer ${authStore.token}`;
    }
    return config;
}, error => {
    return Promise.reject(error);
});

export const useStudentScheduleStore = defineStore('studentSchedule', () => {
    const schedule = ref([]);
    const isLoading = ref(false);
    const error = ref(null);

    async function fetchStudentSchedule(params) {
        isLoading.value = true;
        error.value = null;
        try {
            const response = await studentApi.get('/student/schedule', { params });
            schedule.value = response.data || [];
        } catch (err) {
            console.error('Error fetching student schedule:', err);
            error.value = err;
            schedule.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    async function cancelLesson(payloadInput) {
        console.log(payloadInput);
        isLoading.value = true;
        error.value = null;
        const payload = {
            lessonScheduleId: payloadInput.id,
            date: format(new Date(payloadInput.lessonDate), 'yyyy-MM-dd')
        };
        try {
            await studentApi.post('/shared/lesson-cancel', payload);
        } catch (err) {
            console.error('Error canceling lesson:', err);
            error.value = err;
            throw err;
        } finally {
            isLoading.value = false;
        }
    }

    // Не забудьте вернуть новую функцию
    return { schedule, isLoading, error, fetchStudentSchedule, cancelLesson };
});