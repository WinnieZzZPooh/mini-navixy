import { defineStore } from 'pinia'
import { ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'

export const useLanguageStore = defineStore('language', () => {
  const i18n = useI18n()
  const locale = ref(localStorage.getItem('app-locale') || 'ru')

  if (i18n.locale.value !== locale.value) {
    i18n.locale.value = locale.value
  }

  const setLocale = (newLocale: string) => {
    locale.value = newLocale
    i18n.locale.value = newLocale
    localStorage.setItem('app-locale', newLocale)
  }

  watch(i18n.locale, (newLocale) => {
    if (locale.value !== newLocale) {
      locale.value = newLocale
      localStorage.setItem('app-locale', newLocale)
    }
  })

  return {
    locale,
    setLocale,
  }
})
