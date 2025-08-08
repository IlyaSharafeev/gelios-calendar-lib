<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()

const props = defineProps({
  item: {
    type: Object,
    required: true
  }
})

const time = computed(() => `${props.item.time.start} - ${props.item.time.end}`)
const direction = computed(() => props.item.direction[locale.value])
const child = computed(() => `${props.item.child.lastName} ${props.item.child.firstName.charAt(0)}.`)
const teacher = computed(() => `${props.item.teacher.lastName} ${props.item.teacher.firstName.charAt(0)}.`)
const isFrozen = computed(() => props.item.isFrozen)

const cellClass = computed(() => {
  // Отменённые уроки - красный фон, курсор неактивен
  if (props.item.status === 'CANCELLED') {
    return 'bg-gred-5 cursor-not-allowed';
  }
  // Перенесённые уроки - голубой фон
  if (props.item.status === 'RESCHEDULED') {
    return '';
  }
  // Замороженные уроки (если они не отменены)
  if (isFrozen.value) {
    return 'bg-gred-5 hover:cursor-not-allowed';
  }
  // Стиль по умолчанию с ховером
  return 'hover:bg-gblue-5';
});

const badgeClass = computed(() => {
  // Для отмененных или замороженных уроков - красный индикатор
  if (props.item.status === 'CANCELLED') {
    return 'text-gred-100 bg-gred-10';
  }
  // Для всех остальных случаев (включая SCHEDULED и RESCHEDULED) - серый по умолчанию
  return 'text-gblack-100 bg-gblack-10';
});


const emit = defineEmits(['itemClick'])
</script>

<template>
  <div
      class="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
      :class="cellClass"
  >
    <div
        class="flex items-center text-xs font-medium rounded-full px-2 py-1"
        :class="badgeClass"
    >
      {{ time }}
    </div>

    <span class="text-xs text-gblack-100">{{ child }}</span>

    <div class="flex gap-2.5 items-center">
      <span class="text-xs font-medium text-gblack-50">{{ direction }}</span>
      <span class="text-xs text-gblack-50">{{ teacher }}</span>
    </div>
  </div>
</template>