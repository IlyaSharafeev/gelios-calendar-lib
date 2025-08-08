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

// ✅ ИЗМЕНЕНИЕ: Теперь отображается только время начала урока
const time = computed(() => props.item.time.start)
const direction = computed(() => props.item.direction[locale.value])
const child = computed(() => `${props.item.child.lastName} ${props.item.child.firstName.charAt(0)}.`)
const teacher = computed(() => `${props.item.teacher.lastName} ${props.item.teacher.firstName.charAt(0)}.`)
const isFrozen = computed(() => props.item.isFrozen)
const isCancelled = computed(() => props.item.status === 'CANCELLED')

// Класс для всей ячейки (меняет фон)
const cellClass = computed(() => {
  if (isCancelled.value) return 'bg-gred-5 cursor-not-allowed'
  if (isFrozen.value) return 'bg-gred-5 hover:cursor-not-allowed'
  return 'hover:bg-gblue-5'
});

// ✅ ИЗМЕНЕНИЕ: Класс для плашки времени (бейджа). По умолчанию теперь синий.
const badgeClass = computed(() => {
  if (isCancelled.value || isFrozen.value) {
    return 'text-gred-100 bg-gred-10'
  }
  // Стиль по умолчанию, как на изображении
  return 'text-gblue-100 bg-gblue-5'
});

// ✅ ИЗМЕНЕНИЕ: Классы для текста. Становятся красными, если урок отменен.
const primaryTextColor = computed(() => isCancelled.value ? 'text-gred-100' : 'text-gblack-100');
const secondaryTextColor = computed(() => isCancelled.value ? 'text-gred-100' : 'text-gblack-50');

</script>

<template>
  <div
      class="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
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
  </div>
</template>