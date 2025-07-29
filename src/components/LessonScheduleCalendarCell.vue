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

// The 'emit' definition is no longer needed for the click event, but we can keep it for future use.
const emit = defineEmits(['itemClick'])
</script>

<template>
  <div
      class="flex items-center justify-between px-3 py-2.5 cursor-pointer transition-colors rounded-xl"
      :class="{
      'bg-gred-5 hover:cursor-not-allowed': isFrozen,
      'hover:bg-gblue-5': !isFrozen
    }"
  >
    <div
        class="flex items-center text-xs font-medium rounded-full px-2 py-1"
        :class="{
        'text-gred-100 bg-gred-10': isFrozen,
        'text-gblue-100 bg-gblue-5': !isFrozen
      }"
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