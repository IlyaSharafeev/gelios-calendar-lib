// store/authStore.js (или подобный путь)
import { reactive } from 'vue'; // Если используете Vue 3 Composition API

const authStore = reactive({
    token: localStorage.getItem('token') || null,
    refreshToken: localStorage.getItem('refreshToken') || null,

    setTokens(accessToken, refreshToken) {
        this.token = accessToken;
        this.refreshToken = refreshToken;
        localStorage.setItem('token', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
    },

    logout() {
        this.token = null;
        this.refreshToken = null;
        localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        // Дополнительная логика для перенаправления пользователя, если необходимо
    },

    // Возможно, вам понадобится метод для инициализации токена при загрузке приложения
    init() {
        this.token = localStorage.getItem('token');
        this.refreshToken = localStorage.getItem('refreshToken');
    }
});

export default authStore;