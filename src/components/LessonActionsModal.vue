<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { useI18n } from 'vue-i18n';
import Datepicker from '@vuepic/vue-datepicker';
import api from '../services/api.js';

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

const emit = defineEmits(['close', 'cancelLesson', 'rescheduleLesson', 'changeTeacherSuccess']);

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

const handleDateChange = (newDatePart) => {
  if (!newDatePart) return;
  const currentDate = editableLesson.value.lessonDate ? new Date(editableLesson.value.lessonDate) : new Date();
  currentDate.setFullYear(newDatePart.getFullYear(), newDatePart.getMonth(), newDatePart.getDate());
  editableLesson.value.lessonDate = currentDate;
};

const handleTimeChange = (newTimePart) => {
  // newTimePart від time-picker'а — це об'єкт, наприклад: { hours: 14, minutes: 30 }
  if (!newTimePart || typeof newTimePart.hours === 'undefined' || typeof newTimePart.minutes === 'undefined') {
    return; // Ігноруємо, якщо дані некоректні
  }

  // Беремо поточну дату або створюємо нову, якщо дата ще не встановлена
  const currentDate = editableLesson.value.lessonDate ? new Date(editableLesson.value.lessonDate) : new Date();

  // Встановлюємо години та хвилини з властивостей об'єкта newTimePart
  currentDate.setHours(newTimePart.hours);
  currentDate.setMinutes(newTimePart.minutes);
  currentDate.setSeconds(0); // Рекомендується також скидати секунди

  // Оновлюємо стан
  editableLesson.value.lessonDate = currentDate;
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
  if (!editableLesson.value.lessonDate || !props.lesson) {
    console.error(t('errors.reschedule-missing-fields'));
    return;
  }
  emit('rescheduleLesson', {
    originalLesson: props.lesson,
    newDate: editableLesson.value.lessonDate
  });
  close();
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