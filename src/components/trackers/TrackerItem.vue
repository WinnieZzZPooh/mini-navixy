<template>
  <div
    class="tracker-item"
    :class="{ selected: isSelected, moving: tracker.state === 'moving' }"
    @click="$emit('click')"
  >
    <div class="tracker-icon" :class="tracker.state" :style="trackerIconStyle"></div>
    <div class="tracker-info">
      <div class="tracker-name">
        {{ tracker.name }}
        <span v-if="tracker.speed" class="tracker-speed">{{ tracker.speed }} km/h</span>
      </div>
      <div class="tracker-coords">
        <v-btn
          v-if="isSelected && tracker.state === 'moving'"
          icon
          size="small"
          variant="text"
          class="follow-btn"
          :color="isFollowing ? 'primary' : ''"
          @click.stop="toggleFollowTracker"
        >
          <v-tooltip activator="parent" location="start">
            {{ isFollowing ? $t('tracker.stopFollow') : $t('tracker.follow') }}
          </v-tooltip>
          <v-icon size="small">mdi-crosshairs-gps</v-icon>
        </v-btn>
        {{ formatCoordinates(tracker.coordinates) }}
      </div>
    </div>

    <v-btn icon size="small" variant="text" @click.stop="openInfoPanel" class="info-btn">
      <v-tooltip activator="parent" location="start">
        {{ $t('tracker.showInfo') }}
      </v-tooltip>
      <v-icon size="small">mdi-information-outline</v-icon>
    </v-btn>

    <div class="tracker-status" :class="tracker.status">
      <v-tooltip activator="parent" location="start">
        {{ $t(`tracker.status.${tracker.status}`) }}
      </v-tooltip>
      <v-icon size="small">
        {{ tracker.status === 'online' ? 'mdi-signal' : 'mdi-signal-off' }}
      </v-icon>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits, computed } from 'vue'
import { useTrackerStore } from '@/stores/trackers'
import { useUIStore } from '@/stores/ui'
import { storeToRefs } from 'pinia'
import { formatCoordinates } from '@/utils/formatting'
import type { Tracker } from '@/types'

const props = defineProps<{
  tracker: Tracker
  isSelected: boolean
}>()

defineEmits<{
  (e: 'click'): void
}>()

const trackerStore = useTrackerStore()
const uiStore = useUIStore()

const { isFollowingTracker } = storeToRefs(trackerStore)

const isFollowing = computed(() => isFollowingTracker.value)

const trackerIconStyle = computed(() => {
  if (props.tracker.photo) {
    return {
      backgroundImage: `url(${props.tracker.photo})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }
  }
  return { backgroundColor: props.tracker.color }
})

const openInfoPanel = (event: Event) => {
  event.stopPropagation()
  trackerStore.selectTracker(props.tracker.id)
  uiStore.openTrackerInfoPanel()
}

const toggleFollowTracker = (event: Event) => {
  event.stopPropagation()
  trackerStore.toggleFollowTracker()
}
</script>

<style lang="scss" scoped>
.tracker-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 3px solid transparent;
  margin: 4px 8px;
  border-radius: 8px;
  max-height: 74px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background-color: rgba(25, 118, 210, 0.08);
    border-left-color: #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  &.moving {
    .tracker-coords {
      color: rgba(0, 0, 0, 0.6) !important;
      font-weight: 700;
    }
  }

  .tracker-icon {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    margin-right: 14px;
    position: relative;

    &.moving {
      animation: pulse 1.5s infinite;

      &:after {
        content: '';
        position: absolute;
        top: 50%;
        left: 50%;
        width: 6px;
        height: 6px;
        background-color: white;
        border-radius: 50%;
        transform: translate(-50%, -50%);
      }
    }
  }

  .tracker-info {
    flex: 1;
    min-width: 0;

    .tracker-name {
      font-weight: 500;
      white-space: nowrap;
      margin-bottom: 4px;
      font-size: 0.95rem;

      .tracker-speed {
        font-size: 0.8rem;
        padding: 2px 6px;
        background-color: rgba(3, 169, 244, 0.15);
        border-radius: 4px;
        color: #03a9f4;
        font-weight: 600;
      }
    }

    .tracker-coords {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
    }
  }

  .tracker-status {
    margin-left: 12px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    border-radius: 50%;

    &.online {
      color: #2ecc71;
      animation: fadeInOut 4s infinite;
    }

    &.offline {
      color: #e74c3c;
      opacity: 0.7;
    }
  }

  .follow-btn,
  .info-btn {
    margin-left: -5px;
    width: 24px;
    height: 24px;
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(3, 169, 244, 0.7);
  }
  70% {
    box-shadow: 0 0 0 8px rgba(3, 169, 244, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(3, 169, 244, 0);
  }
}

@keyframes blink {
  0% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
  100% {
    opacity: 1;
  }
}

@keyframes fadeInOut {
  0% {
    opacity: 0.7;
  }
  50% {
    opacity: 1;
  }
  100% {
    opacity: 0.7;
  }
}
</style>
