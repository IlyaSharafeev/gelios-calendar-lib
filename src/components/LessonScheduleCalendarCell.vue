<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { Icon } from '@iconify/vue'

const { locale } = useI18n()

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const time = computed(() => props.item.time.start)
const direction = computed(() => props.item.direction[locale.value])
const child = computed(() => `${props.item.child.lastName} ${props.item.child.firstName.charAt(0)}.`)
const teacher = computed(() => `${props.item.teacher.lastName} ${props.item.teacher.firstName.charAt(0)}.`)
const isFrozen = computed(() => props.item.course_status === 'FROZEN')
const isCancelled = computed(() => props.item.status === 'CANCELLED')
const isCompleted = computed(() => props.item.status === 'DONE' || props.item.status === 'MISSED')

const cellClass = computed(() => {
  if (isCancelled.value) return 'bg-gred-5 cursor-not-allowed'
  if (isFrozen.value) return 'bg-gred-5 hover:cursor-not-allowed'
  return 'hover:bg-gblue-5'
});

const badgeClass = computed(() => {
  if (isCancelled.value || isFrozen.value) {
    return 'text-gred-100 bg-gred-10'
  }
  // Стиль по умолчанию, как на изображении
  return 'text-gblue-100 bg-gblue-5'
});

const primaryTextColor = computed(() => isCancelled.value ? 'text-gred-100' : 'text-gblack-100');
const secondaryTextColor = computed(() => isCancelled.value ? 'text-gred-100' : 'text-gblack-50');

const statusIcon = computed(() => {
  if (props.item.status === 'DONE') {
    return 'material-symbols:check-circle-outline-rounded';
  }
  if (props.item.status === 'MISSED') {
    return 'material-symbols:cancel-outline-rounded';
  }
  return '';
});

const statusText = computed(() => {
  if (props.item.status === 'DONE') {
    return 'Проведено';
  }
  if (props.item.status === 'MISSED') {
    return 'Пропущено';
  }
  return '';
});
</script>

<template>
  <div
      class="relative flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
      :class="cellClass"
  >
    <div class="flex items-center gap-4">
      <div
          class="flex items-center text-sm font-medium rounded-full px-2.5 py-1"
          :class="badgeClass"
      >
        {{ time }}
      </div>

      <div class="flex flex-col">
        <span class="text-base font-medium" :class="primaryTextColor">{{ direction }}</span>
        <span class="text-xs" :class="secondaryTextColor">{{ locale.toUpperCase() }}</span>
      </div>

      <div class="flex flex-col">
        <span class="text-sm" :class="primaryTextColor">{{ teacher }}</span>
        <span class="text-xs" :class="secondaryTextColor">тренер</span>
      </div>
    </div>

    <span class="text-sm" :class="secondaryTextColor">
      {{ child }}
    </span>

    <div v-if="item.status === 'DONE'" class="status-indicator success">
      <Icon icon="material-symbols:check-circle-outline-rounded" width="16" height="16" />
      <span>Проведено</span>
    </div>

    <div v-if="item.status === 'MISSED'" class="status-indicator danger">
      <Icon icon="material-symbols:cancel-outline-rounded" width="16" height="16" />
      <span>Пропущено</span>
    </div>
  </div>
</template>

<style scoped>
.status-indicator {
  position: absolute;
  bottom: 8px;
  right: 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  padding: 2px 6px;
  border-radius: 8px;
  line-height: 1;
}

.status-indicator.success {
  background-color: #f0fdf4; /* Light green for DONE */
  color: #16a34a; /* Green for DONE */
}

.status-indicator.danger {
  background-color: #fef2f2; /* Light red for MISSED */
  color: #dc2626; /* Red for MISSED */
}
</style>