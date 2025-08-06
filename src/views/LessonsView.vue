<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
// Убраны импорты старого api, так как они больше не нужны здесь
import { format, parse, isWithinInterval } from 'date-fns'

// Импортируем оба стора
import { useTeacherScheduleStore } from '../store/teacherScheduleStore.js'
import { useStudentScheduleStore } from '../store/studentScheduleStore.js'

import BaseFilterPanel from '../components/BaseFilterPanel.vue'
import WeekCalendar from '../components/WeekCalendar.vue'
import LessonScheduleCalendarCell from '../components/LessonScheduleCalendarCell.vue'
import authStore from '../store/authStore.js';

// Type definitions for better clarity
interface Schedule {
  id: number;
  childCourse: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  child: { id: number; firstName: string; lastName: string; patronymic: string };
  teacher: { id: number; firstName: string; lastName: string; patronymic: string };
  direction: { id: number; en: string; uk: string; ru: string };
  startDate: string | null;
}

// NOTE: Логика заморозок (freezes) пока отключена, так как для нового API
// не предоставлен отдельный эндпоинт для них.
interface Freeze {
  id: number;
  childCourse: number;
  startDate: string;
  endDate: string;
}

interface CalendarItem extends Schedule {
  isFrozen: boolean;
  lessonDate: Date;
  time: {
    start: string;
    end: string;
  };
}

const router = useRouter()
const route = useRoute()

// Инициализируем оба стора
const teacherScheduleStore = useTeacherScheduleStore();
const studentScheduleStore = useStudentScheduleStore();

const instance = ref({ data: [], total: 0 })
const viewMode = ref(localStorage.getItem('viewMode') || null);

const dateRange = ref({startDate: null, endDate: null})

// Handle schedule click for navigation
const handleScheduleClick = (schedule) => {
  console.log('Переход к уроку (навигация):', schedule)
}

// Simplified mapping of day names to JavaScript day numbers (0-6)
const DAY_NAME_TO_JS_DAY = {
  'MONDAY': 1, 'TUESDAY': 2, 'WEDNESDAY': 3, 'THURSDAY': 4, 'FRIDAY': 5, 'SATURDAY': 6, 'SUNDAY': 0
};

/**
 * Converts schedules and freeze data into calendar items
 */
const processSchedulesAndFreezes = (
    schedules: Schedule[],
    freezes: Freeze[] // Принимаем заморозки, но сейчас они всегда будут пустым массивом
) => {
  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    return { data: [], total: 0 };
  }

  const startDate = parse(dateRange.value.startDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(dateRange.value.endDate, 'yyyy-MM-dd', new Date());
  const calendarItems: CalendarItem[] = [];

  const allDatesInRange: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    allDatesInRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  schedules.forEach(schedule => {
    const scheduleDayNumber = DAY_NAME_TO_JS_DAY[schedule.dayOfWeek];
    const matchingDates = allDatesInRange.filter(date => date.getDay() === scheduleDayNumber);

    matchingDates.forEach(date => {
      if (schedule.startDate) {
        const scheduleStartDate = parse(schedule.startDate, 'yyyy-MM-dd', new Date());
        if (date < scheduleStartDate) return;
      }

      // Поскольку эндпоинта для заморозок нет, считаем что заморозок нет
      const isFrozen = false;

      const scheduledStartDate = new Date(date);
      const startTimeParts = (schedule.startTime || '00:00:00').split(':');
      scheduledStartDate.setHours(parseInt(startTimeParts[0], 10), parseInt(startTimeParts[1], 10));

      const scheduledEndDate = new Date(date);
      const endTimeParts = (schedule.endTime || '00:00:00').split(':');
      scheduledEndDate.setHours(parseInt(endTimeParts[0], 10), parseInt(endTimeParts[1], 10));

      calendarItems.push({
        ...schedule, isFrozen, lessonDate: scheduledStartDate,
        time: {
          start: format(new Date(scheduledStartDate), 'HH:mm'),
          end: format(new Date(scheduledEndDate), 'HH:mm')
        }
      });
    });
  });

  return { data: calendarItems, total: calendarItems.length };
};

const fetch = async () => {
  if (!authStore.token || !dateRange.value.startDate) {
    return;
  }

  try {
    if (viewMode.value === 'teacher') {
      const params = {
        start_date: dateRange.value.startDate,
        end_date: dateRange.value.endDate,
        search: route.query.search || null,
      };
      await teacherScheduleStore.fetchTeacherSchedule(params);
      // Обрабатываем данные, передавая пустой массив для заморозок
      instance.value = processSchedulesAndFreezes(teacherScheduleStore.schedule, []);

    } else { // Логика для режима СТУДЕНТА
      const params = {
        start_date: dateRange.value.startDate,
        end_date: dateRange.value.endDate,
        search: route.query.search || null,
        child_id: route.query.child_id || null,
        teacher_id: route.query.teacher_id || null,
      };
      await studentScheduleStore.fetchStudentSchedule(params);
      // Обрабатываем данные, передавая пустой массив для заморозок
      instance.value = processSchedulesAndFreezes(studentScheduleStore.schedule, []);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

const handleWeekChange = (range) => {
  dateRange.value = {
    startDate: format(new Date(range.start_date), 'yyyy-MM-dd'),
    endDate: format(new Date(range.end_date), 'yyyy-MM-dd')
  };
  fetch();
}

// НОВЫЙ ОБРАБОТЧИК ДЛЯ ОТМЕНЫ УРОКА
const handleLessonCancel = async (lesson) => {
  if (!lesson || !lesson.id || !lesson.lessonDate) {
    console.error('Недостаточно данных для отмены урока:', lesson);
    return;
  }

  try {
    // 1. Формируем payload для запроса
    const payload = {
      lessonScheduleId: lesson.id,
      date: format(new Date(lesson.lessonDate), 'yyyy-MM-dd')
    };

    console.log('Отправка запроса на отмену урока с данными:', payload);

    // 2. Вызываем метод из хранилища
    await studentScheduleStore.cancelLesson(payload);

    console.log('Урок успешно отменен.');

    // 3. Обновляем расписание, чтобы отмененный урок исчез
    fetch();

  } catch (err) {
    console.error('Ошибка при отмене урока в компоненте:', err);
    // Здесь можно добавить логику для отображения ошибки пользователю
  }
};

// Watch for changes that should trigger a re-fetch
watch(
    () => [route.query.search, route.query.teacher_id, route.query.child_id, authStore.token, viewMode.value],
    fetch, // Упрощено до прямой передачи функции fetch
    { immediate: true }
);

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.data) {
      switch (event.data.type) {
        case 'SET_AUTH_TOKENS':
          authStore.setTokens(event.data.accessToken, event.data.refreshToken);
          break;
        case 'SET_VIEW_MODE':
          viewMode.value = event.data.viewMode;
          localStorage.setItem('viewMode', event.data.viewMode);
          break;
          // NOTE: обработчик для 'SET_API_BASE_URL' убран, так как он больше не нужен
      }
    }
  });
});
</script>

<template>
  <section class="bg-ggray-bg px-8 pb-8 overflow-y-auto">
    <BaseFilterPanel
        :total="instance.total"
        :is-pagination="false"
    />
    <article class="mt-6 flex flex-col">
      <WeekCalendar
          :calendar-items="instance.data"
          date-field="lessonDate"
          :view-mode="viewMode"
          @week-change="handleWeekChange"
          @item-click="handleScheduleClick"
          @cancel-lesson="handleLessonCancel"
      >
        <template #calendarItem="{ item }">
          <LessonScheduleCalendarCell :item="item" />
        </template>
      </WeekCalendar>
    </article>
  </section>
</template>