<template>
  <transition
    name="panel"
    @before-enter="beforeEnter"
    @enter="onEnter"
    @before-leave="beforeLeave"
    @leave="onLeave"
  >
    <div
      v-if="uiStore.isTrackerInfoPanelOpen && trackerStore.selectedTracker"
      class="tracker-info-panel"
    >
      <div class="panel-header">
        <h3 class="panel-title">{{ $t('tracker.info') }}</h3>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          @click="uiStore.closeTrackerInfoPanel"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="panel-content">
        <div class="info-section">
          <div class="info-label">{{ $t('tracker.name') }}</div>
          <div class="info-value">{{ trackerStore.selectedTracker.name }}</div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('tracker.coordinates') }}</div>
          <div class="info-value">
            {{ formatCoordinates(trackerStore.selectedTracker.coordinates) }}
          </div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('tracker.connectionLabel') }}</div>
          <div class="info-value">
            {{ $t(`tracker.status.${trackerStore.selectedTracker.status}`) }}
          </div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('tracker.statusLabel') }}</div>
          <div class="info-value">
            {{ $t(`tracker.status.${trackerStore.selectedTracker.state}`) }}
          </div>
        </div>

        <div class="info-section">
          <div class="info-label">{{ $t('tracker.color') }}</div>
          <div class="photo-selection" v-if="trackerStore.selectedTracker?.photo">
            <div class="photo-preview">
              <img
                :src="trackerStore.selectedTracker.photo"
                alt="Tracker Photo"
                class="tracker-photo"
              />
              <v-btn icon size="30" variant="text" class="remove-photo-btn" @click="removePhoto">
                <v-icon size="small">mdi-close</v-icon>
              </v-btn>
            </div>
          </div>
          <div class="color-selection" v-if="!trackerStore.selectedTracker?.photo">
            <div class="color-circles">
              <div
                v-for="color in trackerColors"
                class="color-circle"
                :key="color"
                :class="{ selected: selectedColor === color }"
                :style="{ backgroundColor: color }"
                @click="updateColor(color)"
              ></div>
            </div>
          </div>
          <div class="photo-upload" v-if="!trackerStore.selectedTracker?.photo">
            <v-btn
              size="small"
              prepend-icon="mdi-camera"
              variant="outlined"
              @click="photoInput.click()"
            >
              {{ $t('tracker.addPhoto') || 'Добавить фото' }}
            </v-btn>
            <input
              type="file"
              ref="photoInput"
              class="d-none"
              accept="image/*"
              @change="onPhotoSelected"
            />
          </div>
        </div>

        <div class="info-section task-info" v-if="assignedTask">
          <div class="info-label">{{ $t('tracker.assignedTask') }}</div>
          <div class="task-details">
            <div class="task-name">{{ assignedTask.name }}</div>
            <div class="task-deadline">
              {{ $t('task.deadline') }}: {{ formatDate(assignedTask.deadline) }}
            </div>
            <div class="task-required" v-if="assignedTask.required">
              <v-chip color="error" size="small" class="required-chip">
                {{ $t('task.required') }}
              </v-chip>
              <div class="task-warning">
                {{ $t('tracker.cannotAssignNew') }}
              </div>
            </div>
          </div>
        </div>

        <div class="info-section task-info" v-else>
          <div class="info-label">{{ $t('tracker.noTask') }}</div>
          <div class="no-task-message">
            {{ $t('tracker.availableForTask') }}
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useTrackerStore } from '@/stores/trackers'
import { useTaskStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { formatCoordinates, formatDate } from '@/utils/formatting'
import { useCustomAnimation } from '@/composables/ui/useCustomAnimation'
import { trackerColors } from '@/constants/colors'

const trackerStore = useTrackerStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

const { infoPanelAnimation } = useCustomAnimation()
const { beforeEnter, onEnter, beforeLeave, onLeave } = infoPanelAnimation

const selectedColor = ref('')
const photoInput = ref<HTMLInputElement | null>(null)

const assignedTask = computed(() => {
  if (!trackerStore.selectedTracker) return null

  return taskStore.tasks.find((task) => task.trackerId === trackerStore.selectedTracker?.id)
})

watch(
  () => trackerStore.selectedTracker,
  (tracker) => {
    selectedColor.value = tracker?.color || '#2ECC71'
  },
  { immediate: true },
)

const updateColor = (color: string) => {
  if (trackerStore.selectedTracker) {
    trackerStore.updateTrackerColor(trackerStore.selectedTracker.id, color)
    selectedColor.value = color
  }
}

const onPhotoSelected = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0] && trackerStore.selectedTracker) {
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result && trackerStore.selectedTracker) {
        trackerStore.updateTrackerPhoto(trackerStore.selectedTracker.id, e.target.result as string)
      }
    }
    reader.readAsDataURL(input.files[0])
  }
}

const removePhoto = () => {
  if (trackerStore.selectedTracker) {
    trackerStore.removeTrackerPhoto(trackerStore.selectedTracker.id)
  }
}
</script>

<style lang="scss" scoped>
.tracker-info-panel {
  position: absolute;
  left: 30px;
  width: 300px;
  background-color: white;
  z-index: 30;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;

  @media (max-width: 768px) {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translate(0) !important;
    z-index: 9999;
  }

  .panel-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 64px;
    padding: 12px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .panel-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }
  }

  .panel-content {
    flex: 1;
    overflow-y: auto;
    padding: 12px;

    .info-section {
      margin-bottom: 14px;

      .info-label {
        font-size: 0.8rem;
        color: rgba(0, 0, 0, 0.6);
        margin-bottom: 2px;
        font-weight: 500;
      }

      .info-value {
        font-size: 0.95rem;
        font-weight: 500;
      }

      .color-selection {
        padding-top: 8px;

        .color-circles {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .color-circle {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 2px solid transparent;

            &:hover {
              transform: scale(1.15);
              box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
            }

            &.selected {
              border: 2px solid white;
              box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
              transform: scale(1.2);
            }
          }
        }
      }

      .photo-selection {
        padding-top: 8px;
        margin-bottom: 10px;

        .photo-preview {
          position: relative;
          width: 60px;
          height: 60px;

          .tracker-photo {
            width: 100%;
            height: 100%;
            object-fit: cover;
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
          }

          .remove-photo-btn {
            position: absolute;
            top: -8px;
            right: -8px;
            background-color: white;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
            border-radius: 50%;
          }
        }
      }

      .photo-upload {
        margin-top: 10px;
      }

      &.task-info {
        background-color: rgba(0, 0, 0, 0.02);
        padding: 10px;
        border-radius: 10px;
        border: 1px solid rgba(0, 0, 0, 0.05);

        .task-details {
          .task-name {
            font-weight: 600;
            font-size: 0.95rem;
            margin-bottom: 4px;
            color: #1976d2;
          }

          .task-deadline {
            font-size: 0.85rem;
            color: rgba(0, 0, 0, 0.7);
            margin-bottom: 6px;
          }

          .task-required {
            margin-top: 6px;

            .task-warning {
              margin-top: 6px;
              font-size: 0.8rem;
              color: #f44336;
              font-style: italic;
            }
          }
        }

        .no-task-message {
          font-size: 0.85rem;
          color: rgba(0, 0, 0, 0.7);
          font-style: italic;
        }
      }
    }
  }

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: rgba(0, 0, 0, 0.05);
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
}
</style>
