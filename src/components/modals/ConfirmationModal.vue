<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { computed } from 'vue';

const { t } = useI18n();

const props = defineProps({
  isOpen: {
    type: Boolean,
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
});

const emit = defineEmits(['close', 'confirm']);

const isClosing = computed(() => !props.isOpen);

const handleConfirm = () => {
  emit('confirm');
};

const handleClose = () => {
  emit('close');
};
</script>

<template>
  <div v-if="isOpen" class="modal-overlay" :class="{ 'modal-closing': isClosing }" @click.self="handleClose">
    <div class="modal-content" :class="{ 'animate-fade-in-up-custom': !isClosing }">
      <h3 class="text-lg font-medium text-gblack-100">{{ title }}</h3>
      <p class="mt-2 text-sm text-gblack-50">{{ message }}</p>
      <div class="button-group">
        <button @click="handleClose" class="action-button button-close flex-grow">
          {{ t('actions.cancel') }}
        </button>
        <button @click="handleConfirm" class="action-button button-confirm flex-grow">
          {{ t('actions.confirm') }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  z-index: 60; /* Higher than LessonActionsModal */
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
  border-radius: 16px;
  padding: 24px;
  transition: all 0.3s ease;
  width: 90%;
  max-width: 420px;
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

.action-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  height: 40px;
  padding: 8px 14px;
  font-weight: 500;
  font-size: 16px;
  line-height: 20px;
  border-radius: 12px;
  transition: background-color 0.2s, color 0.2s, border-color 0.2s;
  cursor: pointer;
  border: 1.5px solid transparent;
}

.button-group {
  display: flex;
  gap: 16px;
  margin-top: 24px;
}

.button-close {
  border-color: #FF3546;
  color: #FF3546;
  background-color: transparent;
}

.button-close:hover {
  background-color: #FF3546;
  color: white;
}

.button-confirm {
  background-color: #0066FF;
  color: #fff;
}

.button-confirm:hover {
  background-color: #0052CC;
}

.flex-grow {
  flex-grow: 1;
}
</style>