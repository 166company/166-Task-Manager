import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import az from './locales/az.json'
import en from './locales/en.json'

i18n
  .use(initReactI18next)
  .init({
    resources: {
      az: { translation: az },
      en: { translation: en },
    },
    lng: localStorage.getItem('lang') || 'az',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  })

export default i18n
