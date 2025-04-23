<template>
  <div class="map-view">
    <MapContainer
      ref="mapContainer"
      :sidebar-width="SIDEBAR_WIDTH"
      :is-sidebar-open="uiStore.isSidebarOpen"
      @tracker-click="handleMapTrackerClick"
      @show-name-dialog="showNameDialog = true"
    />

    <!-- Отображаем элементы управления только если не в режиме редактирования -->
    <TrackerList v-if="!uiStore.isEditMode" ref="trackerList" @tracker-click="handleTrackerClick" />
    <GeoZoneList v-if="!uiStore.isEditMode" ref="geoZoneList" @geozone-click="handleGeoZoneClick" />
    <TaskList
      v-if="!uiStore.isEditMode"
      ref="taskList"
      @task-added="handleTaskAdded"
      @task-click="handleTaskClick"
    />

    <div class="geozone-btn-container">
      <v-btn
        v-if="!uiStore.isEditMode"
        icon
        variant="elevated"
        size="large"
        @click="uiStore.toggleGeoZoneList"
        class="geozone-fixed-btn"
      >
        <v-icon>mdi-shape-polygon-plus</v-icon>
      </v-btn>
    </div>
    <div class="task-btn-container">
      <v-btn
        v-if="!uiStore.isEditMode"
        icon
        variant="elevated"
        size="large"
        @click="uiStore.toggleTaskList"
        class="task-fixed-btn"
      >
        <v-icon>mdi-format-list-checkbox</v-icon>
      </v-btn>
    </div>

    <!-- Панель режима редактирования -->
    <EditModeControls
      v-if="uiStore.isEditMode"
      @activate-polygon-drawing="handleActivatePolygonDrawing"
      @mapbox-draw-delete="handleMapboxDrawDelete"
    />

    <!-- Диалог для ввода названия геозоны -->
    <GeoZoneNameDialog v-model="showNameDialog" />

    <div
      class="language-selector-container"
      :class="{ 'sidebar-open': uiStore.isSidebarOpen }"
      v-if="!uiStore.isEditMode"
    >
      <language-selector :compact="uiStore.isSidebarOpen" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useI18n } from 'vue-i18n'
import { useTrackerStore } from '@/stores/trackers'
import { useGeoZoneStore } from '@/stores/geozones'
import { useTaskStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import MapContainer from '@/components/map/MapContainer.vue'
import TrackerList from '@/components/trackers/TrackerList.vue'
import GeoZoneList from '@/components/geozones/GeoZoneList.vue'
import TaskList from '@/components/tasks/TaskList.vue'
import LanguageSelector from '@/components/language/LanguageSelector.vue'
import EditModeControls from '@/components/geozones/EditModeControls.vue'
import GeoZoneNameDialog from '@/components/geozones/GeoZoneNameDialog.vue'

const SIDEBAR_WIDTH = 320

const { t } = useI18n()
const trackerStore = useTrackerStore()
const geoZoneStore = useGeoZoneStore()
const taskStore = useTaskStore()
const uiStore = useUIStore()

const { selectedTrackerId, isFollowingTracker } = storeToRefs(trackerStore)
const { selectedGeoZoneId, isDrawMode, isSmartZoneMode } = storeToRefs(geoZoneStore)
const { isSidebarOpen } = storeToRefs(uiStore)

const mapContainer = ref(null)
const trackerList = ref(null)
const geoZoneList = ref(null)
const taskList = ref(null)
const showNameDialog = ref(false)

const handleTrackerClick = (trackerId: string) => {
  trackerStore.selectTracker(trackerId)
}

const handleMapTrackerClick = (trackerId: string) => {
  trackerStore.selectTracker(trackerId)

  if (trackerList.value && uiStore.isSidebarOpen) {
    trackerList.value.scrollToTracker(trackerId)
  }
}

const handleGeoZoneClick = (geoZoneId: string) => {
  geoZoneStore.selectGeoZone(geoZoneId)
}

const handleTaskAdded = (taskId: string) => {
  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (task) {
    mapContainer.value.centerOnTracker(task.trackerId)
    alert(t('task.taskAddedSuccess'))
  }
}

const handleTaskClick = (taskId: string) => {
  const task = taskStore.tasks.find((t) => t.id === taskId)
  if (task) {
    mapContainer.value.centerOnTracker(task.trackerId)
    // showTaskPreview(task);
  }
}

const handleActivatePolygonDrawing = () => {
  if (mapContainer.value) {
    mapContainer.value.activatePolygonDrawing()
  }
}

const handleMapboxDrawDelete = () => {
  if (mapContainer.value) {
    mapContainer.value.deletePolygon()
  }
}

watch(selectedTrackerId, (newId) => {
  if (!newId || !mapContainer.value) return
  mapContainer.value.centerOnTracker(newId)
})

watch(selectedGeoZoneId, (newId) => {
  if (!newId || !mapContainer.value) return
  mapContainer.value.centerOnGeoZone(newId)
})

watch(isSidebarOpen, () => {
  if (selectedTrackerId.value && mapContainer.value) {
    setTimeout(() => {
      mapContainer.value.centerOnTracker(selectedTrackerId.value)
    }, 300)
  }
})

watch([isDrawMode, isSmartZoneMode], ([newDrawMode, newSmartZoneMode]) => {
  uiStore.setEditMode(newDrawMode || newSmartZoneMode)
})

onMounted(async () => {
  await trackerStore.fetchTrackers()
  await geoZoneStore.fetchGeoZones()

  // mock setup
  trackerStore.selectTracker('1')
  setTimeout(() => {
    uiStore.toggle3DMode()
  },1000)

  window.addEventListener('click', () => {
    if (isFollowingTracker.value) {
      trackerStore.toggleFollowTracker()
    }
  })
})
</script>

<style lang="scss" scoped>
.map-view {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;

  .geozone-btn-container {
    position: absolute;
    top: 16px;
    right: 16px;
    z-index: 2000;
    pointer-events: auto;
  }

  .task-btn-container {
    position: fixed;
    top: 16px;
    right: 84px;
    z-index: 3000;
    pointer-events: auto;
  }

  .geozone-fixed-btn,
  .task-fixed-btn {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &:hover {
      transform: scale(1.05);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
    }
  }

  .language-selector-container {
    position: absolute;
    bottom: 16px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 10;
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);

    &.sidebar-open {
      transform: translateX(calc(-50% + 160px));
    }
  }
}

@media (max-width: 768px) {
  .map-view {
    .geozone-btn-container {
      top: 10px;
      right: 10px;
    }

    .task-btn-container {
      top: 10px;
      right: 80px;
    }

    .language-selector-container {
      bottom: 10px;

      &.sidebar-open {
        transform: translateX(-50%);
      }
    }
  }
}
</style>
