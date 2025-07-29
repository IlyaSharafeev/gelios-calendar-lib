<script setup lang="ts">
import {onMounted, ref, watch} from 'vue'
import { useRouter, useRoute } from 'vue-router'
// Импортируем обе функции
import api, { setApiBaseURL, setRefreshTokenBaseURL } from '../services/api.js'
import { format, parse, isWithinInterval } from 'date-fns'

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

const instance = ref({ data: [], total: 0 })
const viewMode = ref(null);

const dateRange = ref({startDate: null, endDate: null})

// Handle schedule click
const handleScheduleClick = (schedule) => {
  console.log('Clicked schedule:', schedule)
}

// Simplified mapping of day names to JavaScript day numbers (0-6)
const DAY_NAME_TO_JS_DAY = {
  'MONDAY': 1,
  'TUESDAY': 2,
  'WEDNESDAY': 3,
  'THURSDAY': 4,
  'FRIDAY': 5,
  'SATURDAY': 6,
  'SUNDAY': 0
};

/**
 * Determines if a specific child course is frozen on a given date
 */
const isCourseFrozenOnDate = (
    freezes: Freeze[],
    childCourseId: number,
    date: Date
): boolean => {
  // Find any freeze period that matches the course and contains the date
  return freezes.some(freeze => {
    // Skip if not for this course
    if (freeze.childCourse !== childCourseId) {
      return false;
    }

    // Skip if missing date information
    if (!freeze.startDate || !freeze.endDate) {
      return false;
    }

    try {
      // Parse dates and check if the target date is within the freeze period
      const freezeStart = parse(freeze.startDate, 'yyyy-MM-dd', new Date());
      const freezeEnd = parse(freeze.endDate, 'yyyy-MM-dd', new Date());

      return isWithinInterval(date, { start: freezeStart, end: freezeEnd });
    } catch (err) {
      console.warn(`Error checking freeze dates for course ${childCourseId}:`, err);
      return false;
    }
  });
};

/**
 * Converts schedules and freeze data into calendar items
 */
const processSchedulesAndFreezes = (
    schedules: Schedule[],
    freezes: Freeze[]
) => {
  // Ensure we have valid date range
  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    return { data: [], total: 0 };
  }

  const startDate = parse(dateRange.value.startDate, 'yyyy-MM-dd', new Date());
  const endDate = parse(dateRange.value.endDate, 'yyyy-MM-dd', new Date());
  const calendarItems: CalendarItem[] = [];

  // Generate all dates in the range
  const allDatesInRange: Date[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= endDate) {
    allDatesInRange.push(new Date(currentDate));
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // For each schedule, find all matching dates and create calendar items
  schedules.forEach(schedule => {
    const scheduleDayNumber = DAY_NAME_TO_JS_DAY[schedule.dayOfWeek];

    // Find all dates that match this schedule's day of week
    const matchingDates = allDatesInRange.filter(date =>
        date.getDay() === scheduleDayNumber
    );

    // Create a calendar item for each matching date
    matchingDates.forEach(date => {
      // Skip if the course hasn't started yet for this date
      if (schedule.startDate) {
        const scheduleStartDate = parse(schedule.startDate, 'yyyy-MM-dd', new Date());
        if (date < scheduleStartDate) {
          return; // Skip this date if it's before the course starts
        }
      }

      // Check if this course is frozen on this date
      const isFrozen = isCourseFrozenOnDate(freezes, schedule.childCourse, date);

      // Create the scheduled date with time from the schedule
      const scheduledStartDate = new Date(date);
      const startTimeParts = (schedule.startTime || '00:00:00').split(':');
      scheduledStartDate.setHours(parseInt(startTimeParts[0], 10));
      scheduledStartDate.setMinutes(parseInt(startTimeParts[1], 10));

      const scheduledEndDate = new Date(date);
      const endTimeParts = (schedule.endTime || '00:00:00').split(':');
      scheduledEndDate.setHours(parseInt(endTimeParts[0], 10));
      scheduledEndDate.setMinutes(parseInt(endTimeParts[1], 10));

      // Add to our calendar items
      calendarItems.push({
        ...schedule,
        isFrozen,
        lessonDate: scheduledStartDate,
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
  // Проверяем, установлен ли baseURL, прежде чем делать запрос
  if (!api.defaults.baseURL || !authStore.token) {
    console.warn("API baseURL or token not set. Waiting for postMessage from parent.");
    return;
  }

  if (!dateRange.value.startDate || !dateRange.value.endDate) {
    return
  }

  try {
    // Create the base params object
    const baseParams = {
      search: route.query.search || null,
      child_id: route.query.child_id || null,
      teacher_id: route.query.teacher_id || null,
    }

    const scheduleParams = {
      ...baseParams,
      status: 'ACTIVE',
      start_date: dateRange.value.startDate,
      end_date: dateRange.value.endDate,
    }

    const freezeParams = {
      ...baseParams,
      // Convert camelCase to snake_case for API params
      start_date: dateRange.value.startDate,
      end_date: dateRange.value.endDate,
    }

    const [schedulesResponse, freezesResponse] = await Promise.all([
      api.get('/education/v1/lesson-schedules', { params: scheduleParams }),
      api.get('/education/v1/course-freezes', { params: freezeParams })
    ])

    const schedules = schedulesResponse.data.data || []
    const freezes = freezesResponse.data.data || []

    instance.value = processSchedulesAndFreezes(schedules, freezes)
  }
  catch (err) {
    console.error('Error fetching data:', err)
  }
}

const handleWeekChange = (range) => {
  dateRange.value = {
    startDate: format(new Date(range.start_date), 'yyyy-MM-dd'),
    endDate: format(new Date(range.end_date), 'yyyy-MM-dd')
  }

  fetch()
}

// Watch for changes in route queries, authStore token, AND api.defaults.baseURL
watch(
    () => [route.query.search, route.query.teacher_id, route.query.child_id, authStore.token, api.defaults.baseURL],
    () => {
      if (dateRange.value.startDate && authStore.token && api.defaults.baseURL) {
        fetch()
      }
    },
    { immediate: true } // Run immediately to fetch initial data if conditions are met
)

onMounted(() => {
  window.addEventListener('message', (event) => {
    // IMPORTANT: Validate the origin of the message for security!
    // Замените 'YOUR_PARENT_ORIGIN' на фактический домен/протокол/порт родительского приложения.
    // Например: if (event.origin !== 'https://test-crm.gelios-school.com') { ... }
    // if (event.origin !== 'YOUR_PARENT_ORIGIN') {
    //   console.warn('Received message from untrusted origin:', event.origin);
    //   return;
    // }

    if (event.data) {
      if (event.data.type === 'SET_AUTH_TOKENS') {
        const { accessToken, refreshToken } = event.data;
        if (accessToken) {
          authStore.setTokens(accessToken, refreshToken);
        }
      } else if (event.data.type === 'SET_API_BASE_URL') {
        const { baseURL, refreshTokenURL } = event.data; // Предполагаем, что родитель может передать оба
        if (baseURL) {
          setApiBaseURL(baseURL); // Устанавливаем основной baseURL
        }
        if (refreshTokenURL) { // Если родитель передал отдельный URL для рефреша
          setRefreshTokenBaseURL(refreshTokenURL); // Устанавливаем его
        }
      } else if (event.data.type === 'SET_VIEW_MODE') {
        if (event.data.viewMode) {
          viewMode.value = event.data.viewMode;
          console.log('View mode set from parent:', viewMode.value);
        }
      }
    }
  });

  // Инициализация fetch будет происходить через watch, когда будут доступны и токен, и baseURL.
  // Если вы хотите, чтобы компонент мог работать без токена для некоторых запросов,
  // вам нужно будет скорректировать логику fetch и watch.
})
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
          @week-change="handleWeekChange"
      >
        <template #calendarItem="{ item }">
          <LessonScheduleCalendarCell
              :item="item"
              @item-click="handleScheduleClick"
          />
        </template>
      </WeekCalendar>
    </article>

  </section>
</template>