<template>
  <div class="map-container" ref="mapContainer">
    <v-btn
      icon
      variant="elevated"
      color="white"
      size="large"
      class="map-3d-toggle-btn"
      @click="toggle3DMode"
    >
      <v-icon size="28" :color="uiStore.is3DMode ? '#1976d2' : 'black'">mdi-video-3d</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useTrackerStore } from '@/stores/trackers'
import { useGeoZoneStore } from '@/stores/geozones'
import { useUIStore } from '@/stores/ui'

import { useMapInitialization } from '@/composables/map/useMapInitialization'
import { useTrackerMarkers } from '@/composables/map/useTrackerMarkers'
import { useMovingTracker } from '@/composables/map/useMovingTracker'
import { useGeoZones } from '@/composables/map/useGeoZones'
import { useEditModes } from '@/composables/map/useEditModes'
import { use3DMode } from '@/composables/map/use3DMode'

const props = defineProps({
  sidebarWidth: {
    type: Number,
    default: 0,
  },
  isSidebarOpen: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['tracker-click', 'geozone-click', 'show-name-dialog'])

const trackerStore = useTrackerStore()
const geoZoneStore = useGeoZoneStore()
const uiStore = useUIStore()

const { trackers, selectedTrackerId, isFollowingTracker } = storeToRefs(trackerStore)
const { geoZones, selectedGeoZoneId, isDrawMode, isSmartZoneMode } = storeToRefs(geoZoneStore)
const { is3DMode } = storeToRefs(uiStore)

const mapContainer = ref<HTMLElement | null>(null)

// Инициализация карты и ее тулзов
const { map, draw, geocoder } = useMapInitialization(mapContainer)

const handleTrackerClick = (trackerId: string) => {
  trackerStore.selectTracker(trackerId)
  uiStore.openTrackerInfoPanel()
  emit('tracker-click', trackerId)
}

const handleGeoZoneClick = (geoZoneId: string) => {
  geoZoneStore.selectGeoZone(geoZoneId)
  emit('geozone-click', geoZoneId)
}

// Инициализация маркеров маячков
const { addMarkersToMap, cleanupMarkers } = useTrackerMarkers(map, trackers, handleTrackerClick)

const { setupMovingTracker, followMovingTracker, cleanupMovingTracker } = useMovingTracker(
  map,
  trackers,
  (id, position) => trackerStore.updateMovingTrackerPosition(id, position),
  handleTrackerClick,
)

// Инициализация геозон
const { addGeoZonesToMap, centerOnGeoZone, cleanupGeoZones } = useGeoZones(
  map,
  geoZones,
  handleGeoZoneClick,
)

// Инициализация режима редактирования (рисования)
const { setupDrawEvents, handleDrawMode, handleSmartZoneMode } = useEditModes(
  map,
  draw,
  geocoder,
  isDrawMode,
  isSmartZoneMode,
  (geoZone) => {
    geoZoneStore.saveTempGeoZone(geoZone)
    emit('show-name-dialog')
  },
  () => emit('show-name-dialog'),
)

// Инициализация 3D мода
const { toggle3DMode } = use3DMode(map, is3DMode)

const centerOnTracker = (trackerId: string) => {
  if (!map.value) return

  const tracker = trackers.value.find((t) => t.id === trackerId)
  if (!tracker) return

  const offset: [number, number] = props.isSidebarOpen ? [props.sidebarWidth / 2, 0] : [0, 0]

  map.value.flyTo({
    center: [tracker.coordinates.lng, tracker.coordinates.lat],
    zoom: 18,
    offset,
    duration: 1500,
  })
}

onMounted(async () => {
  if (!map.value) return

  const handleMapLoad = async () => {
    await trackerStore.fetchTrackers()
    await geoZoneStore.fetchGeoZones()
    addMarkersToMap()
    addGeoZonesToMap()
    setupMovingTracker()
    setupDrawEvents()
  }

  map.value.on('load', handleMapLoad)

  map.value.on('dragstart', () => {
    if (isFollowingTracker.value) {
      trackerStore.toggleFollowTracker()
    }
  })
})

onUnmounted(() => {
  cleanupMarkers()
  cleanupMovingTracker()
  cleanupGeoZones()
})

watch(isDrawMode, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleDrawMode()
  }
})

watch(isSmartZoneMode, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    handleSmartZoneMode()
  }
})

watch(isFollowingTracker, (isFollowing) => {
  if (isFollowing) {
    followMovingTracker(isFollowingTracker)
  }
})

watch(selectedTrackerId, (newId) => {
  if (newId) {
    centerOnTracker(newId)
  }
})

watch(selectedGeoZoneId, (newId) => {
  if (newId) {
    centerOnGeoZone(newId)
  }
})

const activatePolygonDrawing = () => {
  if (draw.value) {
    draw.value.changeMode('draw_polygon')
  }
}

const deletePolygon = () => {
  if (draw.value) {
    draw.value.trash()
  }
}

defineExpose({
  centerOnTracker,
  centerOnGeoZone,
  toggle3DMode,
  activatePolygonDrawing,
  deletePolygon,
})
</script>

<style lang="scss" scoped>
.map-container {
  width: 100%;
  height: 100vh;
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;

  @media (max-width: 768px) {
    :deep(.mapboxgl-ctrl-geocoder) {
      top: 200px;
      width: 95vw;
      box-shadow: none;
      border: 1px solid rgba(0, 0, 0, 0.23);
      border-radius: 8px;
    }
  }
}

.map-3d-toggle-btn {
  position: absolute;
  bottom: 16px;
  right: 16px;
  z-index: 5;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

:deep(.tracker-marker) {
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;

  .tracker-icon {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid white;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);

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

  .tracker-label {
    margin-top: 5px;
    background-color: rgba(0, 0, 0, 0.7);
    color: white;
    padding: 3px 8px;
    border-radius: 4px;
    font-size: 12px;
    white-space: nowrap;
    max-width: 160px;
    overflow: hidden;
    text-overflow: ellipsis;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

    .tracker-speed {
      display: inline-block;
      margin-left: 5px;
      padding: 1px 4px;
      background-color: rgba(3, 169, 244, 0.2);
      border-radius: 3px;
      font-size: 10px;
      color: #03a9f4;
      font-weight: 600;
    }
  }
}

:deep(.trail-marker) {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: rgba(3, 169, 244, 0.8);
  box-shadow: 0 0 8px rgba(3, 169, 244, 0.7);
  transition: all 0.3s ease;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    background-color: rgba(3, 169, 244, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%) scale(1.5);
    z-index: -1;
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(3, 169, 244, 0.7);
  }

  70% {
    transform: scale(1.1);
    box-shadow: 0 0 0 10px rgba(3, 169, 244, 0);
  }

  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(3, 169, 244, 0);
  }
}
</style>
