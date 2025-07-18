import { ref } from 'vue'

export default function useDebounce(callback, delay = 500) {
  const timer = ref(null)

  const debounce = (...args) => {
    clearTimeout(timer.value)
    timer.value = setTimeout(() => {
      callback(...args)
    }, delay)
  }

  return debounce
}
