<script setup lang="ts">
import { onMounted, ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format, parse } from 'date-fns'

// Импортируем сторы
import { useTeacherScheduleStore } from '../store/teacherScheduleStore.js'
import { useStudentScheduleStore } from '../store/studentScheduleStore.js'

import BaseFilterPanel from '../components/BaseFilterPanel.vue'
import WeekCalendar from '../components/WeekCalendar.vue'
import LessonScheduleCalendarCell from '../components/LessonScheduleCalendarCell.vue'
import authStore from '../store/authStore.js';

// Type definitions
interface Schedule {
  id: number;
  childCourse: number;
  date: string;
  startTime: string;
  endTime: string;
  child: { id: string; firstName: string; lastName: string; };
  teacher: { id: string; firstName: string; lastName: string; };
  direction: { id: number; en: string; uk: string; ru: string };
  link: string | null;
  course_status: 'FROZEN' | 'ACTIVE' | string;
  status: 'SCHEDULED' | 'RESCHEDULED' | 'CANCELLED' | string;
}

interface CalendarItem extends Omit<Schedule, 'date' | 'startTime' | 'endTime'> {
  isFrozen: boolean;
  lessonDate: Date;
  time: {
    start: string;
    end: string;
  };
}

const router = useRouter()
const route = useRoute()

const teacherScheduleStore = useTeacherScheduleStore();
const studentScheduleStore = useStudentScheduleStore();

const instance = ref<{ data: CalendarItem[]; total: number }>({ data: [], total: 0 })
const viewMode = ref(localStorage.getItem('viewMode') || null);

const dateRange = ref({startDate: null, endDate: null})

const handleScheduleClick = (schedule: CalendarItem) => {
  console.log('Переход к уроку (навигация):', schedule)
}

/**
 * Converts schedules data into calendar items
 * @param schedules - The array of lesson objects from the API.
 */
const processSchedules = (schedules: Schedule[]) => {
  if (!schedules) {
    return { data: [], total: 0 };
  }

  const calendarItems: CalendarItem[] = schedules.map(schedule => {
    const lessonDate = parse(`${schedule.date} ${schedule.startTime}`, 'yyyy-MM-dd HH:mm:ss', new Date());

    return {
      ...schedule,
      isFrozen: schedule.course_status === 'FROZEN',
      lessonDate: lessonDate,
      time: {
        start: format(lessonDate, 'HH:mm'),
        end: format(parse(schedule.endTime, 'HH:mm:ss', new Date()), 'HH:mm')
      }
    };
  });

  return { data: calendarItems, total: calendarItems.length };
};

const fetch = async () => {
  if (!authStore.token || !dateRange.value.startDate) {
    return;
  }

  try {
    const params = {
      start_date: dateRange.value.startDate,
      end_date: dateRange.value.endDate,
      search: route.query.search || null,
      child_id: route.query.child_id || null,
      teacher_id: route.query.teacher_id || null,
    };

    if (viewMode.value === 'teacher') {
      await teacherScheduleStore.fetchTeacherSchedule(params);
      instance.value = processSchedules(teacherScheduleStore.schedule);
    } else {
      await studentScheduleStore.fetchStudentSchedule(params);
      instance.value = processSchedules(studentScheduleStore.schedule);
    }
  } catch (err) {
    console.error('Error fetching data:', err);
  }
}

const handleWeekChange = (range: { start_date: string; end_date: string }) => {
  dateRange.value = {
    startDate: format(new Date(range.start_date), 'yyyy-MM-dd'),
    endDate: format(new Date(range.end_date), 'yyyy-MM-dd')
  };
}

const handleLessonCancel = async (lesson: CalendarItem) => {
  if (!lesson || !lesson.id || !lesson.lessonDate) {
    console.error('Недостаточно данных для отмены урока:', lesson);
    return;
  }

  try {
    const payload = {
      id: lesson.id,
      lessonDate: lesson.lessonDate
    };

    console.log('Отправка запроса на отмену урока с данными:', payload);

    await studentScheduleStore.cancelLesson(payload);

    console.log('Урок успешно отменен.');
    fetch();

  } catch (err) {
    console.error('Ошибка при отмене урока в компоненте:', err);
  }
};

watch(
    () => [route.query.search, route.query.teacher_id, route.query.child_id, authStore.token, viewMode.value, dateRange.value],
    fetch,
    { immediate: true, deep: true }
);

onMounted(() => {
  window.addEventListener('message', (event) => {
    if (event.data) {
      switch (event.data.type) {
        case 'SET_AUTH_TOKENS':
          authStore.setTokens(event.data.accessToken, event.data.refreshToken);
          break;
        case 'SET_VIEW_MODE':
          const newMode = event.data.viewMode;
          if (viewMode.value !== newMode) {
            viewMode.value = newMode;
            localStorage.setItem('viewMode', newMode);
          }
          break;
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
      >
        <template #calendarItem="{ item }">
          <LessonScheduleCalendarCell :item="item" />
        </template>
      </WeekCalendar>
    </article>
  </section>
</template>