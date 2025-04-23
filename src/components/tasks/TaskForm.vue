<template>
  <v-dialog v-model="dialog" max-width="600" persistent>
    <v-card class="task-form">
      <v-card-title class="d-flex justify-space-between align-center">
        <span>{{ $t('task.add') }}</span>
        <v-btn icon variant="text" @click="closeDialog">
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </v-card-title>

      <div class="task-content">
        <div v-if="!showPreview">
          <v-form ref="form" @submit.prevent="validateAndPreview">
            <v-text-field
              v-model="taskData.name"
              :label="$t('task.nameLabel')"
              :rules="[(v) => !!v || $t('task.nameRequired')]"
              required
              variant="outlined"
              class="mb-3"
            />

            <v-textarea
              v-model="taskData.description"
              :label="$t('task.descriptionLabel')"
              :rules="[(v) => !!v || $t('task.descriptionRequired')]"
              required
              variant="outlined"
              rows="3"
              class="mb-3"
            />

            <v-text-field
              v-model="taskData.comment"
              :label="$t('task.commentLabel')"
              :hint="$t('task.commentHint')"
              :rules="[(v) => !v || v.length <= 20 || $t('task.commentTooLong')]"
              variant="outlined"
              class="mb-3"
              persistent-hint
            />

            <v-select
              v-model="taskData.geoZoneId"
              :items="geoZones"
              item-title="name"
              item-value="id"
              :label="$t('task.geoZoneLabel')"
              variant="outlined"
              class="mb-3"
              clearable
              @update:model-value="handleGeoZoneChange"
            />

            <v-select
              v-model="taskData.trackerId"
              :items="availableTrackers"
              item-title="name"
              item-value="id"
              :label="$t('task.trackerLabel')"
              :rules="[(v) => !!v || $t('task.trackerRequired')]"
              required
              variant="outlined"
              class="mb-3"
            />

            <v-autocomplete
              v-model="taskData.address"
              :items="addressSuggestions"
              :loading="isLoadingAddresses"
              :label="$t('task.addressLabel')"
              :rules="[(v) => !!v || $t('task.addressRequired')]"
              required
              variant="outlined"
              class="mb-3"
              prepend-inner-icon="mdi-map-marker"
              :error-messages="addressValidationError"
              @update:search="searchAddress"
              @update:model-value="handleAddressSelected"
              no-filter
              hide-no-data
              return-object
              item-title="place_name"
              ref="addressField"
            />

            <v-menu
              v-model="showDatePicker"
              :close-on-content-click="false"
              transition="scale-transition"
              min-width="auto"
            >
              <template v-slot:activator="{ props }">
                <v-text-field
                  v-model="formattedDeadline"
                  :label="$t('task.deadlineLabel')"
                  readonly
                  v-bind="props"
                  :rules="[(v) => !!v || $t('task.deadlineRequired')]"
                  required
                  variant="outlined"
                  prepend-inner-icon="mdi-calendar"
                />
              </template>
              <v-date-picker
                v-model="taskData.deadline"
                @update:model-value="showDatePicker = false"
              />
            </v-menu>

            <v-checkbox
              v-model="taskData.required"
              :label="$t('task.requiredLabel')"
              :hint="$t('task.requiredHint')"
              persistent-hint
            />

            <div class="d-flex justify-end mt-4">
              <v-btn color="primary" variant="elevated" type="submit" :loading="isValidating">
                {{ $t('task.preview') }}
              </v-btn>
            </div>
          </v-form>
        </div>

        <task-preview
          v-else
          :task-data="taskData"
          @back="showPreview = false"
          @save="saveTask"
          @save-translated="saveTranslatedTask"
        />
      </div>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/tasks'
import { useGeoZoneStore } from '@/stores/geozones'
import { useTrackerStore } from '@/stores/trackers'
import TaskPreview from './TaskPreview.vue'
import mapboxgl from 'mapbox-gl'

import type { Task } from '@/types'

const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'task-added', taskId: string): void
}>()

const { t } = useI18n()
const taskStore = useTaskStore()
const geoZoneStore = useGeoZoneStore()
const trackerStore = useTrackerStore()

const dialog = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const form = ref(null)
const showDatePicker = ref(false)
const showPreview = ref(false)
const isValidating = ref(false)
const addressField = ref<HTMLElement | null>(null)
const addressValidationError = ref<string | null>(null)
const addressSuggestions = ref<any[]>([])
const isLoadingAddresses = ref(false)

const initialData = {
  id: '',
  name: '',
  description: '',
  comment: '',
  geoZoneId: '',
  trackerId: '',
  address: '',
  coordinates: {
    lat: 0,
    lng: 0,
  },
  deadline: new Date().toISOString().substr(0, 10),
  required: false,
  createdAt: '',
}

const taskData = ref(initialData)

const geoZones = computed(() => {
  return geoZoneStore.geoZones
})

const availableTrackers = computed(() => {
  return trackerStore.trackers.filter((tracker) => {
    // Если трекер уже назначен на обязательное задание, исключаем его
    return !taskStore.isTrackerAssigned(tracker.id)
  })
})

const formattedDeadline = computed(() => {
  if (!taskData.value.deadline) return ''

  const date = new Date(taskData.value.deadline)
  return date.toLocaleDateString()
})

watch(
  () => dialog.value,
  (newVal) => {
    if (!newVal) {
      resetForm()
    }
  },
)

const resetForm = () => {
  taskData.value = initialData
  showPreview.value = false
}

const closeDialog = () => {
  dialog.value = false
}

const handleGeoZoneChange = () => {
  // При изменении геозоны, сбрасываем адрес, чтобы юзер ввел новый
  taskData.value.address = ''
  taskData.value.coordinates = { lat: 0, lng: 0 }
}

const validateAddress = async () => {
  if (
    !taskData.value.address ||
    !taskData.value.coordinates.lat ||
    !taskData.value.coordinates.lng
  ) {
    return
  }

  isValidating.value = true
  addressValidationError.value = null

  try {
    // Валидируем, если геозона выбрана
    if (taskData.value.geoZoneId) {
      const selectedGeoZone = geoZones.value.find((gz) => gz.id === taskData.value.geoZoneId)

      if (selectedGeoZone) {
        // Проверяем, находятся ли координаты в пределах геозоны
        const isWithinGeoZone = isPointInPolygon(
          [taskData.value.coordinates.lng, taskData.value.coordinates.lat],
          selectedGeoZone.coordinates,
        )

        if (!isWithinGeoZone) {
          addressValidationError.value = t('task.addressOutsideGeoZone')
          taskData.value.coordinates = { lat: 0, lng: 0 }
        }
      }
    }
  } catch (error) {
    console.error('Error validating address:', error)
    addressValidationError.value = t('task.addressValidationError')
  } finally {
    isValidating.value = false
  }
}

// Алгоритм "точка в полигоне" для проверки того, находятся ли координаты в пределах геозоны
const isPointInPolygon = (point: [number, number], polygon: Array<[number, number]>): boolean => {
  const x = point[0]
  const y = point[1]

  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0]
    const yi = polygon[i][1]
    const xj = polygon[j][0]
    const yj = polygon[j][1]

    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }

  return inside
}

const validateAndPreview = async () => {
  const formRef = form.value || { validate: async () => ({ valid: false }) }
  const isValid = await formRef?.validate()

  if (isValid?.valid) {
    if (
      taskData.value.address &&
      taskData.value.coordinates.lat !== 0 &&
      taskData.value.coordinates.lng !== 0
    ) {
      await validateAddress()
    }

    showPreview.value = true
  }
}

const saveTask = () => {
  const newTask: Task = {
    ...taskData.value,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  const addedTask = taskStore.addTask(newTask)
  emit('task-added', addedTask.id)
  closeDialog()
}

const saveTranslatedTask = (translatedTask: Task) => {
  const newTask: Task = {
    ...translatedTask,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
  }

  const addedTask = taskStore.addTask(newTask)
  emit('task-added', addedTask.id)
  closeDialog()
}

// Поиск адресов с помощью геокодера Mapbox
const searchAddress = async (query: string) => {
  if (!query || query.length < 2) {
    addressSuggestions.value = []
    return
  }

  isLoadingAddresses.value = true

  try {
    const endpoint = 'https://api.mapbox.com/geocoding/v5/mapbox.places/'
    const url = `${endpoint}${encodeURIComponent(query)}.json?access_token=${MAPBOX_API_KEY}&autocomplete=true&limit=5&types=place,address,poi&country=ru,us,gb,de,fr`

    const response = await fetch(url)
    const data = await response.json()

    if (data.features && data.features.length > 0) {
      // Хуярим результат в v-autocomplete
      addressSuggestions.value = data.features.map((feature: any) => ({
        place_name: feature.place_name,
        center: feature.center,
      }))
    } else {
      addressSuggestions.value = []
    }
  } catch (error) {
    console.error('Error fetching address:', error)
    addressSuggestions.value = []
  } finally {
    isLoadingAddresses.value = false
  }
}

const handleAddressSelected = (selectedAddress: any) => {
  if (!selectedAddress) return

  taskData.value.coordinates = {
    lng: selectedAddress.center[0],
    lat: selectedAddress.center[1],
  }

  validateAddress()
}

onMounted(() => {
  geoZoneStore.fetchGeoZones()
  trackerStore.fetchTrackers()

  mapboxgl.accessToken = MAPBOX_API_KEY
})

onUnmounted(() => {
  addressSuggestions.value = []
})
</script>

<style lang="scss" scoped>
.task-form {
  .v-card-title {
    padding: 16px 20px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }

  .task-content {
    padding: 20px;
  }

  :deep(.mapboxgl-ctrl-geocoder) {
    width: 100%;
    max-width: 100%;
    box-shadow: none;
    border: 1px solid rgba(0, 0, 0, 0.23);
    border-radius: 4px;
  }
}
</style>
