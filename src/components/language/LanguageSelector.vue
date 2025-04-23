<template>
  <div class="language-selector">
    <v-menu location="top" :close-on-content-click="true">
      <template v-slot:activator="{ props }">
        <v-btn
          variant="outlined"
          v-bind="props"
          class="language-btn"
          elevation="2"
          rounded="pill"
          :title="$t('language.select')"
        >
          <span class="flag">{{ getCurrentLocale().flag }}</span>
          <span class="lang-name" v-if="!compact">{{ getCurrentLocale().name }}</span>
          <v-icon size="small" class="ml-1">mdi-chevron-up</v-icon>
        </v-btn>
      </template>
      <v-list density="compact" class="language-list" rounded="lg" elevation="8">
        <v-list-item
          v-for="locale in availableLocales"
          :key="locale.code"
          :value="locale.code"
          :active="locale.code === currentLocale"
          @click="changeLocale(locale.code)"
          class="language-list-item"
          rounded="lg"
        >
          <v-list-item-title class="d-flex align-center">
            <span class="flag">{{ locale.flag }}</span>
            <span class="locale-name">{{ locale.name }}</span>
          </v-list-item-title>
        </v-list-item>
      </v-list>
    </v-menu>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useLanguageStore } from '@/stores/language'
import { availableLocales } from '@/i18n'

defineProps({
  compact: {
    type: Boolean,
    default: false,
  },
})

const { locale } = useI18n()
const languageStore = useLanguageStore()
const currentLocale = computed(() => locale.value)

const getCurrentLocale = () => {
  return availableLocales.find((l) => l.code === currentLocale.value) || availableLocales[0]
}

const changeLocale = (localeCode: string) => {
  languageStore.setLocale(localeCode)
}
</script>

<style lang="scss" scoped>
.language-selector {
  .language-btn {
    background-color: rgba(255, 255, 255, 0.9);
    border-color: rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 1);
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }

    &:active {
      transform: translateY(0);
    }

    .flag {
      margin-right: 8px;
      font-size: 1.4em;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .lang-name {
      margin-right: 8px;
      font-size: 0.9rem;
      font-weight: 500;
    }
  }
}

:deep(.language-list) {
  background-color: rgba(255, 255, 255, 0.95);
  overflow: hidden;
  backdrop-filter: blur(10px);

  .language-list-item {
    margin: 4px;
    transition: all 0.3s ease;

    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      transform: translateX(2px);
    }

    &.v-list-item--active {
      background-color: rgba(25, 118, 210, 0.1);
      font-weight: 500;
    }

    .flag {
      margin-right: 12px;
      font-size: 1.4em;
      filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.2));
    }

    .locale-name {
      font-size: 0.9rem;
    }
  }
}
</style>
