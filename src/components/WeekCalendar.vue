<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  startOfWeek,
  addDays,
  format,
  addWeeks,
  subWeeks,
  setMilliseconds,
  setSeconds,
  setMinutes,
  setHours
} from 'date-fns'
import { enUS, ru, uk } from 'date-fns/locale'
import { Icon } from '@iconify/vue'
import IconPlus from '../components/icons/IconPlus.vue'
import LessonActionsModal from '../components/LessonActionsModal.vue' // Keep the actions modal

const props = defineProps({
  calendarItems: {
    type: Array,
    required: true
  },
  dateField: {
    type: String,
    default: 'lessonDate' // Field containing the item date
  },
  idField: {
    type: String,
    default: 'id'
  },
})

const emit = defineEmits(['weekChange', 'itemClick'])

const { t, locale } = useI18n()
const currentDate = ref(new Date())
const expandedSlots = ref(new Set())

// State for LessonActionsModal
const isLessonActionsModalOpen = ref(false)
const selectedLesson = ref(null) // To pass the clicked lesson details to the actions modal


const getLocale = computed(() => {
  switch (locale.value) {
    case 'en':
      return enUS
    case 'uk':
      return uk
    case 'ru':
      return ru
    default:
      return enUS
  }
})

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

const weekDays = computed(() => {
  const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })

  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(weekStart, i)

    const formatDate = (date: Date) => {
      const [day, month] = format(date, 'd MMMM', { locale: getLocale.value }).split(' ')
      return `${day} ${capitalizeFirstLetter(month)}`
    }

    return {
      date: formatDate(date),
      name: capitalizeFirstLetter(format(date, 'EEEE', { locale: getLocale.value })),
      fullDate: date
    }
  })
})

const formatDateRange = computed(() => {
  const firstDay = weekDays.value[0].fullDate
  const lastDay = weekDays.value[6].fullDate

  const formatDate = (date: Date) => {
    const [day, month] = format(date, 'd MMMM', { locale: getLocale.value }).split(' ')
    return `${day} ${capitalizeFirstLetter(month)}`
  }
  return `${formatDate(firstDay)} - ${formatDate(lastDay)}`
})

// Methods
const formatHour = (hour: number) => {
  return `${String(hour).padStart(2, '0')}:00`
}

const getRecords = (date: Date, hour: number) => {
  const dateKey = format(date, 'yyyy-MM-dd')
  const hourStr = String(hour).padStart(2, '0')

  return props.calendarItems.filter(item => {
    const itemDate = new Date(item[props.dateField])
    return format(itemDate, 'yyyy-MM-dd') === dateKey &&
      format(itemDate, 'HH') === hourStr
  })
}

const displayRecords = (date: Date, hour: number) => {
  const records = getRecords(date, hour)
  const slotKey = `${date.toISOString()}-${hour}`
  return expandedSlots.value.has(slotKey) ? records : records.slice(0, 4)
}

const hasMoreRecords = (date: Date, hour: number) => {
  return getRecords(date, hour).length > 4
}

const isExpanded = (date: Date, hour: number) => {
  return expandedSlots.value.has(`${date.toISOString()}-${hour}`)
}

const toggleExpand = (date: Date, hour: number) => {
  const slotKey = `${date.toISOString()}-${hour}`
  const newExpanded = new Set(expandedSlots.value)
  newExpanded.has(slotKey) ? newExpanded.delete(slotKey) : newExpanded.add(slotKey)
  expandedSlots.value = newExpanded
}

const prevWeek = () => {
  currentDate.value = subWeeks(currentDate.value, 1)
  emitWeekChange()
}

const nextWeek = () => {
  currentDate.value = addWeeks(currentDate.value, 1)
  emitWeekChange()
}

const emitWeekChange = () => {
  const weekStart = startOfWeek(currentDate.value, { weekStartsOn: 1 })
  const weekEnd = addDays(weekStart, 6)

  const startDate = setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(weekStart, 0),
        0),
      0),
    0)

  const endDate = setMilliseconds(
    setSeconds(
      setMinutes(
        setHours(weekEnd, 23),
        59),
      59),
    999)

  emit('weekChange', {
    start_date: startDate.toISOString(),
    end_date: endDate.toISOString()
  })
}

// Function for 'add lesson' button (now without DemoLessonModal)
const addLesson = (date: Date, hour: number) => {
  // If DemoLessonModal is removed, you need a new modal component or a different
  // approach for adding a new lesson here.
  // For now, this button will not open a modal.
  // console.log('Add Lesson functionality needs a new modal or different implementation.', { date, hour });
  // Example: You might open LessonActionsModal in a 'create new' mode if it supports it
  // selectedLesson.value = { lessonDate: setHours(setMinutes(date, 0), hour).toISOString() };
  isLessonActionsModalOpen.value = true;
};

// Function to open LessonActionsModal for an existing lesson
const openLessonActionsModal = (lesson: any) => {
  selectedLesson.value = lesson; // Store the clicked lesson
  isLessonActionsModalOpen.value = true; // Open the actions modal
};

// Handle LessonActionsModal close and actions
const handleLessonActionsModalClose = () => {
  isLessonActionsModalOpen.value = false;
  selectedLesson.value = null;
};

const handleGoToLesson = (lesson: any) => {
  console.log('Навигация к уроку:', lesson);
  emit('itemClick', lesson);
};

const handleCancelLesson = (lesson: any) => {
  console.log('Отмена урока:', lesson);
  // After cancellation, re-fetch lessons:
  emitWeekChange();
};

const handleRescheduleSuccess = (lesson: any) => {
  console.log('Урок успешно перенесен:', lesson);
  // After successful reschedule, re-fetch lessons:
  emitWeekChange();
};

const handleChangeTeacher = (lesson: any) => {
  console.log('Смена преподавателя для урока:', lesson);
  // Implement teacher change logic here
  emitWeekChange();
};


onMounted(() => {
  emitWeekChange()
})
</script>

<template>
  <div class="flex items-center gap-5 mb-5 mt-2 animate-fade-in-up [animation-fill-mode:forwards]">
    <div class="flex gap-1">
      <button @click="prevWeek">
        <Icon icon="material-symbols:chevron-left" width="24" height="24" color="#0066FF" />
      </button>

      <button @click="nextWeek">
        <Icon icon="material-symbols:chevron-right" width="24" height="24" color="#0066FF" />
      </button>
    </div>

    <span class="text-base font-medium text-gblack-50">{{ formatDateRange }}</span>
  </div>

  <div class="flex h-full gap-8">

    <div class="flex flex-col gap-3 mt-[52px]">
      <div
        class="flex w-[108px] min-h-[88px] items-center justify-center bg-gblack-5 rounded-[22px] opacity-0 transition-all duration-300 animate-fade-in-up [animation-fill-mode:forwards]"
        v-for="(hour, index) in 24"
        :style="{
          'grid-template-columns': 'repeat(7, 340px)',
          'animation-delay': `${index * 50}ms`,
        }"
      >
        <span class="text-base font-medium text-gblack-50">{{ formatHour(hour - 1) }}</span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <div
        class="grid gap-6 mb-3 animate-fade-in-up [animation-fill-mode:forwards] h-10"
        style="grid-template-columns: repeat(7, 340px);"
      >
        <div
          v-for="day in weekDays"
          :key="day.date"
          class="flex items-center justify-center gap-4 text-gblack-50 bg-white rounded-xl"
        >
          <span class="text-sm font-medium">{{ day.name }}</span>
          <div class="w-1 h-1 bg-gblack-50 rounded-full" />
          <span class="text-sm font-medium">{{ day.date }}</span>
        </div>
      </div>

      <div class="grid gap-3">
        <div
          v-for="(hour, index) in 24"
          :key="hour"
          class="grid gap-6 opacity-0 transition-all duration-300 animate-fade-in-up [animation-fill-mode:forwards]"
          :style="{
            'grid-template-columns': 'repeat(7, 340px)',
            'animation-delay': `${index * 50}ms`,
          }"
        >

          <div
            v-for="day in weekDays"
            :key="day.date + hour"
            class="min-h-[88px] bg-white rounded-xl"
          >
            <div class="add-lesson-wrapper">
              <div class="add-lesson" @click="addLesson(day.fullDate, hour - 1)">
                <div class="icon-plus"></div>
                Занятие
              </div>
            </div>
            <slot
              name="calendarItem"
              v-for="record in displayRecords(day.fullDate, hour - 1)"
              :key="record[props.idField]"
              :item="record"
              @click="openLessonActionsModal(record)" ></slot>

            <div
              v-if="hasMoreRecords(day.fullDate, hour - 1)"
              @click="toggleExpand(day.fullDate, hour - 1)"
              class="text-center cursor-pointer bg-gblack-3 py-0.5"
            >
              <Icon
                :class="isExpanded(day.fullDate, hour - 1) ? 'rotate-90' : '-rotate-90'"
                icon="material-symbols:chevron-left"
                width="20"
                height="20"
                color="#0066FF"
                class="mx-auto"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <LessonActionsModal
    :is-open="isLessonActionsModalOpen"
    :lesson="selectedLesson"
    @close="handleLessonActionsModalClose"
    @go-to-lesson="handleGoToLesson"
    @cancel-lesson="handleCancelLesson"
    @reschedule-success="handleRescheduleSuccess" @change-teacher="handleChangeTeacher"
  />
</template>

<style lang="scss">
.add-lesson-wrapper {
  display: flex;
  justify-content: center;
  padding-top: 12px;

  .add-lesson {
    border: 1px solid #0066FF;
    border-radius: 55px;
    padding: 6px 34px;
    color: #0066FF;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease;

    &:hover {
      background-color: #0066FF;
      color: #fff;
      border-color: #0066FF;

      .icon-plus {
        filter: brightness(0) invert(1);
      }
    }
  }
}

.icon-plus {
  background-image: url('@/assets/icons/plus.svg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 16px;
  height: 16px;
  padding-bottom: 5px;
  margin-bottom: 4px;
  transition: filter 0.3s ease;
}
</style>
