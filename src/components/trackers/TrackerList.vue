<template>
  <div>
    <v-btn
      v-if="!uiStore.isSidebarOpen"
      icon
      variant="elevated"
      color="white"
      size="large"
      @click="uiStore.toggleSidebar"
      class="sidebar-toggle-btn"
    >
      <v-icon>mdi-navigation-variant-outline</v-icon>
    </v-btn>

    <transition name="sidebar" @before-enter="beforeEnter" @enter="onEnter" @leave="onLeave">
      <div class="tracker-list" v-if="uiStore.isSidebarOpen">
        <div class="tracker-list-header">
          <h2 class="tracker-list-title">{{ $t('app.title') }}</h2>
          <v-btn
            icon
            variant="text"
            density="comfortable"
            @click="uiStore.toggleSidebar"
            class="toggle-btn"
          >
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </div>

        <div class="tracker-list-content">
          <div class="search-container">
            <v-text-field
              v-model="searchQuery"
              :label="$t('app.search')"
              density="compact"
              variant="outlined"
              prepend-inner-icon="mdi-magnify"
              hide-details
              class="search-input"
            ></v-text-field>
          </div>

          <div class="trackers-container" ref="trackersContainer">
            <tracker-item
              v-for="tracker in filteredTrackers"
              :key="tracker.id"
              :tracker="tracker"
              :is-selected="trackerStore.selectedTrackerId === tracker.id"
              @click="handleTrackerClick(tracker.id)"
              ref="trackerItems"
            />
          </div>
        </div>
      </div>
    </transition>

    <tracker-info-panel />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, type ComponentPublicInstance } from 'vue'
import { storeToRefs } from 'pinia'
import { useUIStore } from '@/stores/ui'
import { useTrackerStore } from '@/stores/trackers'
import { useCustomAnimation } from '@/composables/ui/useCustomAnimation'
import TrackerItem from './TrackerItem.vue'
import TrackerInfoPanel from './TrackerInfoPanel.vue'

const trackerStore = useTrackerStore()
const uiStore = useUIStore()

const { trackers, selectedTrackerId } = storeToRefs(trackerStore)

const searchQuery = ref('')
const trackersContainer = ref<HTMLElement | null>(null)
const trackerItems = ref<ComponentPublicInstance[]>([])

const { sidebarAnimation } = useCustomAnimation()
const { beforeEnter, onEnter, onLeave } = sidebarAnimation

const filteredTrackers = computed(() => {
  if (!searchQuery.value) return trackers.value

  const query = searchQuery.value.toLowerCase()
  return trackers.value.filter((tracker) => tracker.name.toLowerCase().includes(query))
})

const handleTrackerClick = (trackerId: string) => {
  trackerStore.selectTracker(trackerId)

  if (window.innerWidth <= 768) {
    uiStore.toggleSidebar()
  }
}

// Автоскролл до выбранного трекера в списке
watch(selectedTrackerId, (newId) => {
  if (!newId || !uiStore.isSidebarOpen) return

  setTimeout(() => {
    const selectedIndex = trackers.value.findIndex((t) => t.id === newId)
    const trackerComponent = trackerItems.value[selectedIndex]

    if (trackerComponent?.$el && trackersContainer.value) {
      const el = trackerComponent.$el as HTMLElement
      trackersContainer.value.scrollTo({
        top: el.offsetTop - trackersContainer.value.offsetHeight / 2 + el.offsetHeight / 2,
        behavior: 'smooth',
      })
    }
  }, 100)
})

defineExpose({
  scrollToTracker: (trackerId: string) => {
    handleTrackerClick(trackerId)
  },
})
</script>

<style lang="scss" scoped>
.sidebar-toggle-btn {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  }
}

.tracker-list {
  position: absolute;
  top: 10px;
  left: 10px;
  height: calc(100% - 20px);
  width: 320px;
  background-color: rgba(255, 255, 255, 0.95);
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border-radius: 12px;

  @media (max-width: 768px) {
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 9999;
  }

  .tracker-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 16px;
    height: 64px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .tracker-list-title {
      margin: 0;
      font-size: 1.25rem;
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .toggle-btn {
      transition: all 0.3s ease;
    }
  }

  .tracker-list-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .search-container {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
    }

    .trackers-container {
      flex: 1;
      overflow-y: auto;
      padding: 8px 0;

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

    .task-button-container {
      padding: 12px 16px;
      border-top: 1px solid rgba(0, 0, 0, 0.1);

      .task-btn {
        height: 44px;
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
}

.sidebar-enter-active,
.sidebar-leave-active {
  position: absolute;
}
</style>
