<template>
  <div class="trainer-selection-component">
    <div class="header">Тренер</div>

    <div class="search-bar">
      <span class="search-icon">
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.5 17.5L13.875 13.875M15.8333 9.16667C15.8333 12.8486 12.8486 15.8333 9.16667 15.8333C5.48477 15.8333 2.5 12.8486 2.5 9.16667C2.5 5.48477 5.48477 2.5 9.16667 2.5C12.8486 2.5 15.8333 5.48477 15.8333 9.16667Z"
            stroke="#0066FF"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <input type="text" v-model="searchQuery" placeholder="Поиск" class="search-input" />
    </div>

    <div class="trainer-list-container">
      <ul class="trainer-list">
        <li
          v-for="trainer in filteredTrainers"
          :key="trainer.name"
          :class="{ 'trainer-item': true, selected: selectedTrainer === trainer.name }"
          @click="selectTrainer(trainer.name)"
        >
          <span class="trainer-name">{{ trainer.name }}</span>
          <span v-if="selectedTrainer === trainer.name" class="checkmark">
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M13.3337 4L6.00033 11.3333L2.66699 8"
                stroke="#0066FF"
                stroke-width="1.5"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </span>
        </li>
        <li v-if="filteredTrainers.length === 0" class="no-results">Нет результатов</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Исходный список тренеров
const allTrainers = ref([
  { name: 'Депутатова Элла' },
  { name: 'Мартыно Светлана' },
  { name: 'Бердник Анна' },
  { name: 'Мартыно Евгений' },
  { name: 'Михальцо Анна' },
])

// Реактивная переменная для поискового запроса
const searchQuery = ref('')

// Реактивная переменная для выбранного тренера
// Инициализируем "Бердник Анна" как выбранного по умолчанию, как на скриншоте
const selectedTrainer = ref('Бердник Анна')

// Вычисляемое свойство для фильтрации списка тренеров
const filteredTrainers = computed(() => {
  if (!searchQuery.value) {
    return allTrainers.value
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase()
  return allTrainers.value.filter((trainer) => trainer.name.toLowerCase().includes(lowerCaseQuery))
})

// Метод для выбора тренера
const selectTrainer = (trainerName) => {
  selectedTrainer.value = trainerName
  console.log('Выбран тренер:', selectedTrainer.value)
  // Здесь вы можете эмитировать событие или выполнить другую логику
  // emit('trainerSelected', trainerName);
}
</script>

<style scoped>
/* Общие стили для компонента */
.trainer-selection-component {
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

.header {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 15px;
}

/* Стили для строки поиска */
.search-bar {
  display: flex;
  align-items: center;
  border-radius: 10px;
  padding: 8px 12px;
  margin-bottom: 20px;
  border: 1px solid #e0e0e0;
  height: 38px;
}

.search-icon {
  font-size: 18px;
  color: #888;
  margin-right: 8px;
}

.search-input {
  border: none;
  outline: none;
  flex-grow: 1;
  font-size: 16px;
  background-color: transparent;
  color: #333;
  padding: 2px 0;
}

.search-input::placeholder {
  color: #bbb;
}

/* Стили для контейнера списка с прокруткой */
.trainer-list-container {
  max-height: 250px; /* Высота для прокручиваемой области */
  overflow-y: auto;
  /* Кастомный скроллбар для WebKit браузеров (Chrome, Safari) */

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb {
    background: #c0c0c0;
    border-radius: 10px;
  }

  &::-webkit-scrollbar-thumb:hover {
    background: #a0a0a0;
  }
}

/* Стили для списка тренеров */
.trainer-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.trainer-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 10px;
  cursor: pointer;
  border-radius: 8px;
  margin-bottom: 4px;
  transition: background-color 0.2s ease;
}

.trainer-item:hover {
  background-color: #f0f0f0;
}

.trainer-item.selected {
  background-color: #e0f2ff; /* Светло-синий фон для выбранного */
  color: #007aff; /* Синий текст для выбранного */
  font-weight: 500;
}

.trainer-item .trainer-name {
  flex-grow: 1;
  font-size: 16px;
  color: #333; /* Цвет текста по умолчанию */
}

.trainer-item.selected .trainer-name {
  color: #007aff; /* Синий текст для выбранного */
}

.checkmark {
  font-size: 20px;
  color: #007aff; /* Синий цвет для галочки */
  /* Галочка становится видимой благодаря v-if в шаблоне */
}

.no-results {
  padding: 12px 10px;
  color: #888;
  text-align: center;
  font-size: 14px;
}
</style>
