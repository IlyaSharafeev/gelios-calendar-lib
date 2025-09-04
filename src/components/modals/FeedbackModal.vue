<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { format, parseISO } from 'date-fns';

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  lesson: {
    type: Object,
    default: null
  },
  status: {
    type: String as () => 'DONE' | 'MISSED',
    required: true
  }
});

const emit = defineEmits(['close', 'submit']);

const { t, locale } = useI18n();
const feedback = ref('');
const isClosing = ref(false);

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    feedback.value = '';
    isClosing.value = false;
  }
});

const isSubmitDisabled = computed(() => feedback.value.trim() === '');

const lessonDate = computed(() => {
  if (!props.lesson?.date) return '';
  return format(parseISO(`${props.lesson.date}T00:00:00`), 'dd.MM.yyyy');
});

const lessonTime = computed(() => props.lesson?.time?.start || '');
const direction = computed(() => props.lesson?.direction?.[locale.value] || '');
const studentName = computed(() => {
  if (!props.lesson?.child) return '';
  return `${props.lesson.child.lastName} ${props.lesson.child.firstName.charAt(0)}.`;
});
// 'Тип' не было в данных урока, добавил заглушку.
const lessonType = computed(() => t('lesson.individual'));

const submitButtonText = computed(() => {
  return props.status === 'DONE' ? t('teacher.lesson_done_submit') : t('teacher.lesson_missed_submit');
});

const close = () => {
  isClosing.value = true;
  setTimeout(() => {
    emit('close');
  }, 300);
};

const handleSubmit = () => {
  if (isSubmitDisabled.value) return;
  emit('submit', { feedback: feedback.value, status: props.status });
  close();
};

</script>

<template>
  <div v-if="isOpen" class="modal-overlay" :class="{ 'modal-closing': isClosing }" @click.self="close">
    <div class="modal-content" :class="{ 'animate-fade-in-up-custom': !isClosing }">
      <h2 class="modal-title">{{ t('feedback.title') }}</h2>

      <div class="lesson-info">
        <div class="info-item">
          <span class="label">{{ t('feedback.lesson_date') }}</span>
          <div class="value-box">{{ lessonDate }}</div>
        </div>
        <div class="info-item">
          <span class="label">{{ t('feedback.lesson_time') }}</span>
          <div class="value-box">{{ lessonTime }}</div>
        </div>
      </div>

      <div class="lesson-details">
        <div>
          <span class="label">{{ t('feedback.direction') }}</span>
          <span class="value">{{ direction }}</span>
        </div>
        <div>
          <span class="label">{{ t('feedback.type') }}</span>
          <span class="value">{{ lessonType }}</span>
        </div>
        <div>
          <span class="label">{{ t('feedback.student') }}</span>
          <span class="value">{{ studentName }}</span>
        </div>
      </div>

      <div class="feedback-area">
        <span class="label">{{ t('feedback.feedback_label') }}</span>
        <textarea
            v-model="feedback"
            :placeholder="t('feedback.placeholder')"
            rows="5"
        ></textarea>
      </div>

      <div class="button-group">
        <button class="action-button back-button" @click="close">
          {{ t('actions.back') }}
        </button>
        <button
            class="action-button submit-button"
            :disabled="isSubmitDisabled"
            @click="handleSubmit"
        >
          {{ submitButtonText }}
        </button>
      </div>

    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60;
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
  border-radius: 22px;
  padding: 32px;
  width: 100%;
  max-width: 500px;
  transition: all 0.3s ease;
}
.modal-title {
  font-size: 24px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 24px;
}
.lesson-info {
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
}
.info-item {
  flex: 1;
}
.label {
  display: block;
  font-size: 14px;
  color: #6b7280;
  margin-bottom: 8px;
}
.value-box {
  background-color: #f3f4f6;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 16px;
  color: #374151;
}
.lesson-details {
  display: flex;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5e7eb;
}
.lesson-details .value {
  font-weight: 500;
  color: #1f2937;
}
.feedback-area textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  resize: vertical;
  font-size: 16px;
}
.feedback-area textarea:focus {
  outline: none;
  border-color: #0066FF;
  box-shadow: 0 0 0 2px rgba(0, 102, 255, 0.2);
}
.button-group {
  display: flex;
  gap: 16px;
  margin-top: 32px;
}
.action-button {
  flex-grow: 1;
  padding: 12px;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}
.back-button {
  background-color: white;
  color: #FF3546;
  border: 1px solid #FF3546;
}
.back-button:hover {
  background-color: #ffebee;
}
.submit-button {
  background-color: #0066FF;
  color: white;
}
.submit-button:hover {
  background-color: #0052CC;
}
.submit-button:disabled {
  background-color: #a5b4fc;
  cursor: not-allowed;
}
@keyframes fade-in-up-custom {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in-up-custom {
  animation: fade-in-up-custom 0.3s ease-out forwards;
}
</style>