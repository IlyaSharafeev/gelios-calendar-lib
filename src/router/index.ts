// router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'lessons', // Теперь корневой путь ведет на LessonsView
    component: () => import('../views/LessonsView.vue'),
    // meta: { auth: true, permission: 'access_lessons_page' }, // Если нужен auth, раскомментируйте
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router