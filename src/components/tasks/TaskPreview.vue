<template>
  <div class="task-preview">
    <div class="preview-header">
      <h2 class="preview-title">
        {{ showDetailsMode ? $t('task.infoTitle') : $t('task.previewTitle') }}
      </h2>
      <v-btn
        v-if="showDetailsMode"
        icon
        variant="text"
        density="comfortable"
        @click="$emit('close')"
        class="close-btn"
      >
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="preview-content">
      <div class="preview-section main-section">
        <div class="task-icon" :class="{ required: taskData.required }">
          <v-icon>
            {{ taskData.required ? 'mdi-alert-circle' : 'mdi-checkbox-blank-circle-outline' }}
          </v-icon>
        </div>
        <h3 class="task-name" ref="nameEl">{{ taskData.name }}</h3>
      </div>

      <div class="preview-section">
        <div class="preview-label">{{ $t('task.descriptionLabel') }}</div>
        <div class="preview-value description-value" ref="descriptionEl">
          {{ taskData.description }}
        </div>
      </div>

      <div class="preview-section" v-if="taskData.comment">
        <div class="preview-label">{{ $t('task.commentLabel') }}</div>
        <div class="preview-value comment-value" ref="commentEl">{{ taskData.comment }}</div>
      </div>

      <div class="preview-section" v-if="taskData.geoZoneId">
        <div class="preview-label">{{ $t('task.geoZoneLabel') }}</div>
        <div class="preview-value">{{ selectedGeoZone?.name || '' }}</div>
      </div>

      <div class="preview-section" v-if="taskData.trackerId">
        <div class="preview-label">{{ $t('task.trackerLabel') }}</div>
        <div class="preview-value">{{ selectedTracker?.name || '' }}</div>
      </div>

      <div class="preview-section" v-if="taskData.address">
        <div class="preview-label">{{ $t('task.addressLabel') }}</div>
        <div class="preview-value address-value" ref="addressEl">{{ taskData.address }}</div>
      </div>

      <div class="preview-section" v-if="taskData.deadline">
        <div class="preview-label">{{ $t('task.deadlineLabel') }}</div>
        <div class="preview-value date-value">{{ formattedDeadline }}</div>
      </div>

      <div class="preview-section">
        <div class="preview-label">{{ $t('task.requiredLabel') }}</div>
        <div class="preview-value status-chip" :class="{ required: taskData.required }">
          <v-icon size="small" class="status-icon">
            {{ taskData.required ? 'mdi-alert-circle' : 'mdi-checkbox-blank-circle-outline' }}
          </v-icon>
          {{ taskData.required ? $t('task.required') : $t('task.optional') }}
        </div>
      </div>
    </div>

    <div class="translate-section" v-if="showTranslateButton && !showDetailsMode">
      <v-btn
        :loading="isTranslating"
        color="info"
        variant="outlined"
        prepend-icon="mdi-translate"
        @click="translateContent"
      >
        {{ $t('task.translateText') }}
      </v-btn>
    </div>

    <div class="d-flex justify-space-between ma-4">
      <v-btn v-if="!showDetailsMode" color="default" variant="outlined" @click="$emit('back')">
        {{ $t('task.back') }}
      </v-btn>

      <v-btn v-if="!showDetailsMode" color="success" variant="elevated" @click="handleSave">
        {{ $t('task.save') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useGeoZoneStore } from '@/stores/geozones'
import { useTrackerStore } from '@/stores/trackers'
import gsap from 'gsap'
import type { Task } from '@/types'
import { useCustomAnimation } from '@/composables/ui/useCustomAnimation.ts'

const props = defineProps<{
  taskData: Task
  showDetailsMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'back'): void
  (e: 'save'): void
  (e: 'save-translated', translatedTask: Task): void
  (e: 'close'): void
}>()

const { locale } = useI18n()
const { animateTextScramble } = useCustomAnimation()
const geoZoneStore = useGeoZoneStore()
const trackerStore = useTrackerStore()

const nameEl = ref<HTMLElement | null>(null)
const descriptionEl = ref<HTMLElement | null>(null)
const commentEl = ref<HTMLElement | null>(null)
const addressEl = ref<HTMLElement | null>(null)
const isTranslating = ref(false)
const translatedTexts = ref<{ [key: string]: string }>({})

const selectedGeoZone = computed(() => {
  return geoZoneStore.geoZones.find((gz) => gz.id === props.taskData.geoZoneId)
})

const selectedTracker = computed(() => {
  return trackerStore.trackers.find((tr) => tr.id === props.taskData.trackerId)
})

const formattedDeadline = computed(() => {
  if (!props.taskData.deadline) return ''

  const date = new Date(props.taskData.deadline)
  return date.toLocaleDateString()
})

// Определяем, нужно ли показывать кнопку перевода
const showTranslateButton = computed(() => {
  return detectLanguage(props.taskData.name + props.taskData.description) !== locale.value
})

// в рамках тестового сделал тупое сравнение кириллицы с латинскими символами
// поскольку локали ru, en
const detectLanguage = (text: string): string => {
  const cyrillicPattern = /[\u0400-\u04FF]/
  if (cyrillicPattern.test(text)) {
    return 'ru'
  }

  return 'en'
}

// Перевод контента
// Я ж блять тупой. Не смогу работать без англ. Надо было 1С учить
const translateContent = async () => {
  if (isTranslating.value) return
  isTranslating.value = true

  try {
    const textsToTranslate = [props.taskData.name, props.taskData.description]

    if (props.taskData.comment) {
      textsToTranslate.push(props.taskData.comment)
    }

    const sourceLang = detectLanguage(props.taskData.name + props.taskData.description)
    const targetLang = locale.value

    const query = textsToTranslate.join('\n')
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`

    const response = await fetch(url)
    const data = await response.json()

    const translatedTextArray = data[0].map((item: Array<string>) => item[0])

    translatedTexts.value = {
      name: translatedTextArray[0],
      description: translatedTextArray[1],
      ...(props.taskData.comment ? { comment: translatedTextArray[2] } : {}),
    }

    const masterTimeline = gsap.timeline()

    if (nameEl.value) {
      const nameTimeline = animateTextScramble(
        nameEl.value as HTMLElement,
        props.taskData.name,
        translatedTexts.value.name,
      )
      masterTimeline.add(nameTimeline, 0)
    }

    if (descriptionEl.value) {
      const descTimeline = animateTextScramble(
        descriptionEl.value as HTMLElement,
        props.taskData.description,
        translatedTexts.value.description,
      )
      masterTimeline.add(descTimeline, 0.2)
    }

    if (props.taskData.comment && commentEl.value) {
      const commentTimeline = animateTextScramble(
        commentEl.value as HTMLElement,
        props.taskData.comment,
        translatedTexts.value.comment,
      )
      masterTimeline.add(commentTimeline, 0.4)
    }
  } catch (error) {
    console.error('Translation error:', error)
  } finally {
    setTimeout(() => {
      isTranslating.value = false
    }, 2000)
  }
}

const handleSave = () => {
  if (Object.keys(translatedTexts.value).length > 0) {
    const translatedTask: Task = {
      ...props.taskData,
      name: translatedTexts.value.name || props.taskData.name,
      description: translatedTexts.value.description || props.taskData.description,
      comment: translatedTexts.value.comment || props.taskData.comment,
      address: props.taskData.address,
    }
    emit('save-translated', translatedTask)
  } else {
    emit('save')
  }
}

onMounted(() => {
  geoZoneStore.fetchGeoZones()
  trackerStore.fetchTrackers()
})
</script>

<style lang="scss" scoped>
.task-preview {
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

  .preview-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 12px 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    background: linear-gradient(135deg, #3498db, #2980b9);

    .preview-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 600;
      color: white;
      letter-spacing: -0.3px;
    }

    .close-btn {
      color: white;
    }
  }

  .preview-content {
    padding: 14px;

    .preview-section {
      margin-bottom: 10px;
      position: relative;

      &:last-child {
        margin-bottom: 0;
      }

      &.main-section {
        display: flex;
        align-items: center;
        margin-bottom: 16px;
        padding-bottom: 12px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.05);

        .task-icon {
          width: 32px;
          height: 32px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 12px;
          background-color: #f8f9fa;
          border-radius: 50%;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

          &.required {
            color: white;
            background: linear-gradient(135deg, #e67e22, #d35400);
          }

          &:not(.required) {
            color: white;
            background: linear-gradient(135deg, #7f8c8d, #576574);
          }
        }

        .task-name {
          font-size: 1.2rem;
          font-weight: 600;
          margin: 0;
          color: #2c3e50;
          line-height: 1.2;
        }
      }

      .preview-label {
        font-size: 0.75rem;
        font-weight: 500;
        color: #7f8c8d;
        margin-bottom: 3px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      .preview-value {
        font-size: 0.9rem;
        color: #34495e;
        padding: 8px 12px;
        background-color: #f8f9fa;
        border-radius: 6px;
        border-left: 3px solid #e0e0e0;

        &.description-value {
          white-space: pre-line;
          line-height: 1.5;
          background-color: rgba(52, 152, 219, 0.05);
          border-left-color: #3498db;
        }

        &.comment-value {
          display: inline-block;
          background-color: rgba(52, 152, 219, 0.08);
          color: #3498db;
          font-size: 0.85rem;
          padding: 4px 8px;
          border-radius: 4px;
          border-left-color: #3498db;
        }

        &.address-value {
          color: #2c3e50;
          font-style: italic;
          background-color: rgba(155, 89, 182, 0.05);
          border-left-color: #9b59b6;
        }

        &.date-value {
          color: #16a085;
          font-weight: 500;
          background-color: rgba(22, 160, 133, 0.05);
          border-left-color: #16a085;
        }

        &.status-chip {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 16px;
          background-color: #f5f5f5;
          color: #7f8c8d;
          font-size: 0.8rem;
          font-weight: 500;
          border-left: none;

          .status-icon {
            margin-right: 4px;
          }

          &.required {
            background-color: rgba(230, 126, 34, 0.1);
            color: #e67e22;
          }
        }
      }
    }
  }

  .translate-section {
    display: flex;
    justify-content: center;
    margin: 4px 0 10px;
  }
}
</style>
