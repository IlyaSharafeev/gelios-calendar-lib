// composables/usePageTitle.ts
import { watch, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'

export default function usePageTitle() {
  const route = useRoute()
  const { t, locale } = useI18n()

  // Create a function to update the title
  const updateTitle = (routeName: string | null | symbol) => {
    if (routeName && typeof routeName === 'string') {
      document.title = `${t(`pages.${routeName}`)} | Gelios CRM`
    }
  }

  // Watch for route changes
  watch(
    () => route.name,
    (newRouteName) => {
      updateTitle(newRouteName)
    },
    { immediate: true }
  )

  // Also watch for locale changes
  watch(
    () => locale.value,
    () => {
      // When locale changes, update title using current route
      updateTitle(route.name)
    }
  )
}
