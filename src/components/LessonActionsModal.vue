<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import Datepicker from '@vuepic/vue-datepicker';
import api from '../services/api.js';
import TrainerSelection from '../components/TrainerSelection.vue'
import {useStudentScheduleStore} from "@/store/studentScheduleStore";

const { t, locale } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  lesson: {
    type: Object,
    default: null
  },
  viewMode: {
    type: String,
    default: null
  }
});

// ИЗМЕНЕНО: Эмит 'goToLesson' больше не нужен, так как навигация обрабатывается ссылкой
const emit = defineEmits(['close', 'cancelLesson', 'rescheduleSuccess', 'changeTeacherSuccess']);

const currentView = ref('actions');
const isClosing = ref(false);

const editableLesson = ref({
  id: null,
  lessonDate: null,
  teacherId: null,
  teacherName: null,
});

const teachers = ref([]);

const isActionsView = computed(() => currentView.value === 'actions');
const isRescheduleView = computed(() => currentView.value === 'reschedule');
const isChangeTeacherView = computed(() => currentView.value === 'change-teacher');

const submitButtonText = computed(() => {
  if (isRescheduleView.value) return t('lesson.reschedule-submit');
  if (isChangeTeacherView.value) return t('lesson.change-teacher-submit');
  return '';
});

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    if (props.lesson) {
      editableLesson.value = {
        id: props.lesson.id,
        lessonDate: props.lesson.lessonDate ? new Date(props.lesson.lessonDate) : null,
        teacherId: props.lesson.teacher,
        teacherName: props.lesson.teacherName || null,
      };
    }
    currentView.value = 'actions';
    isClosing.value = false;
    // fetchTeachers();
  } else {
    isClosing.value = true;
    setTimeout(() => {
      isClosing.value = false;
      resetModalState();
    }, 300);
  }
}, { immediate: true });

const resetModalState = () => {
  currentView.value = 'actions';
  editableLesson.value = {
    id: null,
    lessonDate: null,
    teacherId: null,
    teacherName: null,
  };
};

const close = () => {
  emit('close');
};

// ИЗМЕНЕНО: Эта функция больше не нужна, так как заменена на тег <a>
/*
const goToLesson = () => {
  emit('goToLesson', props.lesson);
  close();
};
*/

const cancelLesson = () => {
  emit('cancelLesson', props.lesson);
  close();
};

const switchToRescheduleView = () => {
  currentView.value = 'reschedule';
};

const switchToChangeTeacherView = () => {
  currentView.value = 'change-teacher';
};

const switchToActionsView = () => {
  currentView.value = 'actions';
};

const handleDateChange = (date) => {
  if (date instanceof Date) {
    editableLesson.value.lessonDate = date;
  } else if (date) {
    editableLesson.value.lessonDate = new Date(date);
  } else {
    editableLesson.value.lessonDate = null;
  }
};

const handleTrainerSelected = (trainerName) => {
  editableLesson.value.teacherName = trainerName;
  const selectedTeacherObject = teachers.value.find(t => t.label === trainerName);
  if (selectedTeacherObject) {
    editableLesson.value.teacherId = selectedTeacherObject.value;
  } else {
    editableLesson.value.teacherId = null;
  }
};

const submitReschedule = async () => {
  if (!editableLesson.value.lessonDate || !editableLesson.value.id) {
    console.error(t('errors.reschedule-missing-fields'));
    return;
  }
  console.log(editableLesson.value);
  emit('rescheduleLesson', props.lesson);
};

const submitChangeTeacher = async () => {
  if (!editableLesson.value.teacherId || !editableLesson.value.id) {
    console.error(t('errors.change-teacher-missing-fields'));
    return;
  }
  try {
    await api.put(`/sales/v1/demo-lessons/${editableLesson.value.id}`, {
      teacher: editableLesson.value.teacherId,
    });
    emit('changeTeacherSuccess', editableLesson.value);
    close();
  }
  catch (error) {
    console.error(t('errors.change-teacher-error'), error);
  }
};

// const fetchTeachers = async () => {
//   try {
//     const config = { params: { paginate: false } };
//     const { data } = await api.get('/users/v1/staff', config);
//     teachers.value = data.map((user) => ({
//       label: `${user.lastName} ${user.firstName}`,
//       value: user.id
//     }));
//     if (editableLesson.value.teacherId && !editableLesson.value.teacherName) {
//       const currentTeacher = teachers.value.find(t => t.value === editableLesson.value.teacherId);
//       if (currentTeacher) {
//         editableLesson.value.teacherName = currentTeacher.label;
//       }
//     }
//   }
//   catch (error) {
//     console.error('Error fetching teachers:', error);
//   }
// };

// onMounted(() => {
//   if (props.isOpen) {
//     fetchTeachers();
//   }
// });

const lessonTimeFormatted = computed(() => {
  if (editableLesson.value.lessonDate instanceof Date && !isNaN(editableLesson.value.lessonDate)) {
    const date = editableLesson.value.lessonDate;
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  }
  return '00:00';
});
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" :class="{ 'modal-closing': isClosing }" @click.self="close">
    <div class="modal-content" :class="{ 'animate-fade-in-up-custom': !isClosing }">
      <div v-if="isActionsView" class="action-buttons-container">

        <a v-if="(viewMode === 'teacher' || !viewMode) && props.lesson && props.lesson.link"
           :href="props.lesson.link"
           target="_blank"
           rel="noopener noreferrer"
           class="action-button primary-button"
           @click="close"
        >
          <svg width="17" height="16" viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg"><g clip-path="url(#clip0_297_17423)"><path d="M9.68611 4.79656C10.1353 4.71331 10.5518 4.50461 10.8873 4.19459C11.2229 3.88458 11.4639 3.48591 11.5823 3.04469C11.7008 2.60347 11.692 2.13773 11.5569 1.70132C11.4218 1.26491 11.1659 0.875656 10.8188 0.578582C10.4717 0.281508 10.0476 0.0887442 9.59561 0.0225832C9.14357 -0.0435778 8.68204 0.0195663 8.26439 0.204713C7.84674 0.38986 7.49003 0.689447 7.23551 1.06883C6.98098 1.44821 6.83905 1.89189 6.82611 2.34856H8.00411C8.93311 2.34856 9.68611 3.10156 9.68611 4.03056V4.79656ZM5.39111 12.5346H8.00411C8.93311 12.5346 9.68611 11.7816 9.68611 10.8526V5.57956H12.4691C12.6544 5.58427 12.8303 5.66231 12.9582 5.79654C13.086 5.93077 13.1554 6.11023 13.1511 6.29556V10.5896C13.1769 11.7014 12.7603 12.778 11.9929 13.5829C11.2255 14.3879 10.1699 14.8553 9.05811 14.8826C7.44011 14.8426 6.05811 13.8926 5.39111 12.5326V12.5346ZM16.1281 3.16256C16.1281 3.38245 16.0848 3.6002 16.0006 3.80336C15.9165 4.00652 15.7932 4.19111 15.6377 4.34661C15.4822 4.5021 15.2976 4.62544 15.0944 4.70959C14.8913 4.79374 14.6735 4.83706 14.4536 4.83706C14.2337 4.83706 14.016 4.79374 13.8128 4.70959C13.6097 4.62544 13.4251 4.5021 13.2696 4.34661C13.1141 4.19111 12.9907 4.00652 12.9066 3.80336C12.8224 3.6002 12.7791 3.38245 12.7791 3.16256C12.7791 2.71845 12.9555 2.29254 13.2696 1.97851C13.5836 1.66448 14.0095 1.48806 14.4536 1.48806C14.8977 1.48806 15.3236 1.66448 15.6377 1.97851C15.9517 2.29254 16.1281 2.71845 16.1281 3.16256ZM13.8901 12.6506L13.7701 12.6486C14.0369 11.9917 14.1665 11.2873 14.1511 10.5786V6.30556C14.155 6.0558 14.1038 5.80827 14.0011 5.58056H15.7931C16.1831 5.58056 16.5001 5.89756 16.5001 6.28756V10.0526C16.4996 10.7414 16.2257 11.4019 15.7386 11.889C15.2515 12.3761 14.591 12.65 13.9021 12.6506H13.8901Z" fill="white"/><path d="M1.182 3.34866H8.004C8.381 3.34866 8.686 3.65366 8.686 4.03066V10.8527C8.68627 10.9423 8.66881 11.0311 8.63463 11.114C8.60045 11.1968 8.55022 11.2721 8.48684 11.3355C8.42346 11.3989 8.34817 11.4491 8.26531 11.4833C8.18244 11.5175 8.09364 11.5349 8.004 11.5347H1.182C1.09237 11.5349 1.00356 11.5175 0.920701 11.4833C0.837838 11.4491 0.76255 11.3989 0.699167 11.3355C0.635785 11.2721 0.58556 11.1968 0.551379 11.114C0.517199 11.0311 0.499739 10.9423 0.500003 10.8527V4.02966C0.500003 3.65266 0.805003 3.34866 1.182 3.34866ZM6.388 5.94466V5.22466H2.798V5.94466H4.155V9.65966H5.025V5.94466H6.388Z" fill="white"/></g><defs><clipPath id="clip0_297_17423"><rect width="16" height="16" fill="white" transform="translate(0.5)"/></clipPath></defs></svg>
          {{ t('lesson.go-to-lesson') }}
        </a>

        <button v-if="viewMode === 'student' || !viewMode" class="action-button danger-text-button" @click="cancelLesson">
          <Icon icon="material-symbols:close-rounded" width="20" height="20" />
          {{ t('lesson.cancel-lesson') }}
        </button>
        <button v-if="viewMode === 'student'" class="action-button primary-text-button" @click="switchToRescheduleView">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M17.5 7.50033H6.25C4.17893 7.50033 2.5 9.17926 2.5 11.2503C2.5 13.3214 4.17893 15.0003 6.25 15.0003H10M17.5 7.50033L14.1667 4.16699M17.5 7.50033L14.1667 10.8337" stroke="#0066FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ t('lesson.reschedule-lesson') }}
        </button>
        <button v-if="!viewMode" class="action-button primary-text-button" @click="switchToChangeTeacherView">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M15.7275 5.83398C14.4396 4.0662 12.3533 2.91732 9.9987 2.91732C6.08668 2.91732 2.91536 6.08863 2.91536 10.0007L2.91536 10.4173M17.082 10.0007C17.082 13.9127 13.9107 17.084 9.9987 17.084C7.64408 17.084 5.55781 15.9351 4.26986 14.1673M18.6654 10.834L16.9987 9.16732L15.332 10.834M4.66536 9.16732L2.9987 10.834L1.33203 9.16732" stroke="#0066FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
          {{ t('lesson.change-teacher') }}
        </button>
      </div>

      <div v-if="isRescheduleView" class="form-container reschedule-form">
        <div class="form-row">
          <div class="form-field-group mr-4">
            <label class="form-label">{{ t('common.time') }}</label>
            <Datepicker
                v-model="editableLesson.lessonDate"
                :placeholder="t('actions.select')"
                :enable-time-picker="true"
                :is-24="true"
                :format="'HH:mm'"
                :preview-format="'HH:mm'"
                :auto-apply="true"
                :time-picker="true"
                :date-picker="false"
                :locale="locale"
                hide-input-icon
                input-class-name="custom-datepicker-input"
                @update:model-value="handleDateChange"
            />
          </div>
          <div class="form-field-group">
            <label class="form-label">{{ t('common.date') }}</label>
            <Datepicker
                v-model="editableLesson.lessonDate"
                :placeholder="t('actions.select')"
                :enable-time-picker="false"
                :format="'dd MMMM'"
                :preview-format="'dd MMMM'"
                :auto-apply="true"
                :locale="locale"
                hide-input-icon
                input-class-name="custom-datepicker-input"
                @update:model-value="handleDateChange"
            />
          </div>
        </div>

        <div class="button-group">
          <button class="action-button danger-button flex-grow button-close" @click="close">
            {{ t('actions.cancel') }}
          </button>
          <button
              class="action-button primary-button flex-grow button-next"
              :disabled="!editableLesson.lessonDate"
              @click="submitReschedule"
          >
            {{ submitButtonText }}
          </button>
        </div>
      </div>

      <div v-if="isChangeTeacherView" class="form-container change-teacher-form">
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Modal overlay and content */
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.3s ease;
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-closing {
  opacity: 0;
}

.modal-content {
  background-color: #fff;
  border-radius: 22px; /* 22px from image */
  padding: 24px; /* Default padding for the whole modal content */
  transition: all 0.3s ease;
}

@keyframes fade-in-up-custom {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-fade-in-up-custom {
  animation: fade-in-up-custom 0.3s ease-out forwards;
}

/* Common button styles */
.action-button {
  display: flex;
  align-items: center;
  justify-content: flex-start;
  gap: 10px; /* 2.5 Tailwind gap is 10px */
  height: 40px; /* h-10 from Tailwind */
  padding: 8px 14px; /* px-3.5 py-2 from Tailwind */
  font-weight: 500; /* font-medium from Tailwind */
  font-size: 16px; /* text-base from Tailwind */
  line-height: 20px; /* leading-5 from Tailwind */
  border-radius: 10px;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  cursor: pointer;
  border: none;
}

.button-close {
  border: 1.5px solid #FF3546;
  color: #FF3546 !important;
  background-color: transparent !important;
  justify-content: center;
  border-radius: 12px;

  &:hover {
    background-color: #FF3546;
    color: white;
  }
}

.button-next {
  border: 1.5px solid #0066FF;
  color: #0066FF !important;
  background-color: transparent !important;
  justify-content: center;
  border-radius: 12px;

  &:hover {
    background-color: #0066FF;
    color: white;
  }
}

.primary-button {
  background-color: #0066FF;
  color: #fff;
}

.primary-button:hover {
  background-color: #0052CC;
}

.primary-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.danger-text-button {
  color: #DC3545;
  background-color: transparent;
}

.danger-text-button:hover {
  background-color: #fef2f2; /* red-50 */
}

.primary-text-button {
  color: #0066FF;
  background-color: transparent;
}

.primary-text-button:hover {
  background-color: #eff6ff; /* blue-50 */
}

.danger-button {
  background-color: #EF4444; /* red-500 */
  color: #fff;
}

.danger-button:hover {
  background-color: #DC2626; /* red-600 */
}

/* Action buttons container for the initial view */
.action-buttons-container {
  display: flex;
  flex-direction: column;
  gap: 16px; /* gap-4 from Tailwind */
}

/* Form container for reschedule and change teacher views */
.form-container {
  /* Removed padding here as TrainerSelection now has its own styling */
  /* This ensures TrainerSelection's internal padding acts as the form's padding */
  padding: 0;
}

.form-row {
  display: flex;
  align-items: flex-start; /* Align items at the top */
  margin-bottom: 24px; /* mb-6 from Tailwind */
}

.form-field-group {
  display: flex;
  flex-direction: column;
  flex: 1; /* flex-1 from Tailwind */
  margin-bottom: 16px; /* mb-4 from Tailwind */
}

.form-field-group.mr-4 {
  margin-right: 16px; /* mr-4 from Tailwind */
}

.form-label {
  font-size: 14px; /* text-sm from Tailwind */
  font-weight: 500; /* font-medium from Tailwind */
  color: #6B7280; /* gray-500 from Tailwind */
  margin-bottom: 15px; /* mb-1 from Tailwind */
  display: block;
}

/* Custom styles for Datepicker input */
.custom-datepicker-input {
  background-color: #f7f7f7;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px 12px;
  font-size: 16px;
  color: #333;
  width: 100%;
  box-sizing: border-box;
}

.custom-datepicker-input:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}

/* Static teacher list in reschedule view */
.static-teacher-list {
  font-size: 14px; /* text-sm from Tailwind */
  color: #374151; /* gray-700 from Tailwind */
  line-height: 1.5;
}

.static-teacher-list p {
  margin-bottom: 4px;
}

/* Button group at the bottom of forms */
.button-group {
  display: flex;
  gap: 16px; /* gap-4 from Tailwind */
}

.flex-grow {
  flex-grow: 1;
}

/* BaseDropdown custom styling */
.base-dropdown-custom :deep(.dropdown-input) {
  background-color: #f7f7f7;
  border-radius: 10px;
  border: 1px solid #e0e0e0;
  padding: 10px 12px;
  font-size: 16px;
  color: #333;
}

.base-dropdown-custom :deep(.dropdown-input:focus) {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}

/* New styles for the Change Teacher view layout */
.grid-container {
  display: flex; /* Using flex for simplicity for 2 columns, can be grid */
  gap: 16px; /* Adjust gap between TrainerSelection and Datepicker */
  margin-bottom: 24px; /* Space before buttons */
  align-items: baseline;
  padding: 0 24px; /* Padding to match modal-content's original horizontal padding */
}

.trainer-selection-col {
  flex: 9; /* Occupy 9 parts of the 12-part layout */
  /* TrainerSelection has its own internal padding */
}

.time-datepicker-col {
  flex: 3; /* Occupy 3 parts of the 12-part layout */
  /* No additional padding, form-field-group handles it */
}

/* Removed modal-header-top styles as it's now part of TrainerSelection */
/*
.modal-header-top { ... }
.modal-title { ... }
.time-display-wrapper { ... }
.time-label { ... }
.time-value { ... }
*/

.change-teacher-form {
  /* This form container now encompasses the grid and the buttons. */
  /* TrainerSelection will handle its own internal padding. */
  padding: 0; /* Remove top/bottom padding to let TrainerSelection and buttons handle it */
}

.change-teacher-buttons {
  margin-top: 0; /* No extra margin here, grid-container has margin-bottom */
  padding: 0 24px 0; /* Padding for the buttons section, from the original modal-content padding */
}
</style>