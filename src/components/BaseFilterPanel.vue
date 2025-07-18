<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'

import useDebounce from '../composables/useDebounce'

import IconPlus from '../components/icons/IconPlus.vue'
import IconSearch from '../components/icons/IconSearch.vue' // Возвращено к оригинальному пути

const props = defineProps({
  total: {
    type: Number,
    required: true,
  },
  actionCallback: {
    type: Function,
    required: false,
  },
  actionTitle: {
    type: String,
    required: false,
  },
  isPagination: {
    type: Boolean,
    required: false,
    default: true,
  }
})

const { t } = useI18n()
const route = useRoute()
const router = useRouter()

// @ts-ignore
const search = ref(route.query.search || '')
const showFilterModal = ref(false) // State to control modal visibility

// @ts-ignore
const debounceSearch = useDebounce((newVal) => {
  const query = { ...route.query, search: newVal }

  if (props.isPagination) {
    // @ts-ignore: TS7053
    query['page'] = 1 // Reset to page 1 for new searches
  }

  router.push({ query: query })
}, 500)


// @ts-ignore
watch(search, (newVal) => {
  if (newVal.length >= 3 || newVal === '') {
    debounceSearch(newVal)
  }
})

// Function to toggle filter modal visibility
const toggleFilterModal = () => {
  showFilterModal.value = !showFilterModal.value
}

// Placeholder functions for modal actions
const applyFilters = () => {
  console.log('Applying filters...')
  // Placeholder for actual filter application logic
  showFilterModal.value = false // Close modal after applying
}

const resetFilters = () => {
  console.log('Resetting filters...')
  // Placeholder for actual filter reset logic
  showFilterModal.value = false // Close modal after resetting
}

</script>

<template>
  <article class="flex justify-between mt-8 h-10 animate-fade-in-up [animation-fill-mode:forwards] relative">

    <div class="flex items-center w-2/3">

      <div class="filter-icon" @click="toggleFilterModal">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M5 10H15M2.5 5H17.5M7.5 15H12.5" stroke="#0066FF" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>

      <div class="relative w-[230px] mr-5">
        <span class="absolute inset-y-0 left-0 flex items-center pl-3.5">
          <IconSearch class="text-[#262A32]" />
        </span>
        <input
            v-model="search"
            type="text"
            class="w-full rounded-lg text-[#262a32] text-sm leading-5 font-medium py-2.5 pr-3.5 pl-[42px]
            placeholder:text-[#bec0c2] focus:outline-none"
            :placeholder="t('common.search')"
        />
      </div>

      <div>
        <span class="text-sm leading-5 font-medium text-[#8d8f94] mr-2.5">{{ t('common.quantity') }}:</span>
        <span class="text-sm leading-5 font-medium text-[#262a32]">{{ total }}</span>
      </div>
    </div>

    <slot name="beforeAction"></slot>

    <div v-if="actionCallback && actionTitle">
      <button
          class="flex items-center gap-2 text-white bg-[#0066ff] rounded-[10px] h-10 px-3.5 py-2"
          @click="actionCallback"
      >
        <IconPlus style="width: 24px" />
        <span class="text-sm leading-5 font-medium">{{ actionTitle }}</span>
      </button>
    </div>

    <Teleport to="body">
      <div v-if="showFilterModal" class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] p-5 bg-white rounded-lg shadow-lg w-[450px]">
        <div class="flex justify-between items-center mb-4">
          <button class="text-[#0066FF] text-sm font-medium">Очистить фильтры</button>
          <label class="flex items-center cursor-pointer">
            <input type="checkbox" class="sr-only peer">
            <div class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-[#0066FF] rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0066FF]"></div>
            <span class="ms-3 text-sm font-medium text-gray-900">Только свободные окна</span>
          </label>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2">Время урока</h4>
          <div class="flex items-center space-x-2">
            <input type="text" value="00:00" class="w-1/2 p-2 border border-gray-300 rounded-lg text-center">
            <span>-</span>
            <input type="text" value="24:00" class="w-1/2 p-2 border border-gray-300 rounded-lg text-center">
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2">Дата урока</h4>
          <div class="relative">
            <input type="text" value="5 Ноября — 5 Ноября" class="w-full p-2 border border-gray-300 rounded-lg pr-10">
            <svg class="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M7.5 2.5V5M12.5 2.5V5M2.5 7.5H17.5M5 17.5H15C16.3807 17.5 17.5 16.3807 17.5 15V5C17.5 3.61929 16.3807 2.5 15 2.5H5C3.61929 2.5 2.5 3.61929 2.5 5V15C2.5 16.3807 3.61929 17.5 5 17.5Z" stroke="#8d8f94" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2">Направление</h4>
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">ШЧ</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">МА</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">ЛГ</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">НЕМ</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">МАТ</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">IT</button>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2">Язык (направления с выбором языка)</h4>
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Укр</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Анг</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Рус</button>
          </div>
        </div>

        <div class="mb-4">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2">Тренер</h4>
          <div class="flex flex-wrap gap-2 mb-2">
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Депутатова Э.</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Бердник А.</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Володько Ж.</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Кличко Э.</button>
          </div>
          <select class="w-full p-2 border border-gray-300 rounded-lg text-sm text-[#262a32]">
            <option>Другой</option>
          </select>
        </div>

        <div class="mb-6">
          <h4 class="text-sm font-medium text-[#8d8f94] mb-2\">Тип урока</h4>
          <div class="flex flex-wrap gap-2">
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Индивидуальный</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Парный</button>
            <button class="px-3 py-1 border border-gray-300 rounded-full text-sm">Групповой</button>
          </div>
        </div>

        <div class="flex justify-between gap-4">
          <button
              class="flex-1 border border-[#0066FF] text-[#0066FF] rounded-[10px] h-10 px-3.5 py-2 text-sm font-medium"
              @click="resetFilters"
          >
            Сбросить
          </button>
          <button
              class="flex-1 bg-[#0066FF] text-white rounded-[10px] h-10 px-3.5 py-2 text-sm font-medium"
              @click="applyFilters"
          >
            Применить
          </button>
        </div>
      </div>
    </Teleport>

  </article>
</template>

<style lang="scss">
.filter-icon {
  background-color: white;
  padding: 10px;
  border-radius: 10px;
  margin-right: 14px;
  cursor: pointer;
  position: relative;
}
</style>