import { createI18n } from 'vue-i18n'

import en from './src/locales/en.json';
import uk from './src/locales/uk.json';
import ru from './src/locales/ru.json';

const messages = {
  en,
  uk,
  ru,
};

const i18n = createI18n({
  legacy: false,
  locale: localStorage.getItem('locale') || 'uk',
  fallbackLocale: 'en',
  messages,
});

export default i18n;
