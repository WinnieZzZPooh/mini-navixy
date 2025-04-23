<template>
  <div class="edit-mode-controls">
    <div class="edit-mode-header">
      <h3>{{ $t('geozone.editMode') }}</h3>
      <span class="edit-mode-body">
        {{ $t('geozone.editModeDesc') }}
        <v-icon>mdi-vector-polygon</v-icon>
        {{ $t('geozone.editModeDescAlt') }}
        <sup>beta</sup>
      </span>
      <v-btn icon variant="text" @click="cancelEditMode" class="cancel-btn">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="edit-mode-actions">
      <v-btn
        v-if="!geoZoneStore.isSmartZoneMode"
        v-tooltip:bottom="$t('geozone.drawPolygonDesc')"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-vector-polygon"
        class="draw-btn"
        @click="toggleDrawPolygon"
      >
        {{ $t('geozone.drawPolygon') }}
      </v-btn>

      <v-btn
        v-if="!isDrawingActive"
        color="primary"
        variant="tonal"
        prepend-icon="mdi-map-marker-radius-outline"
        class="smart-zone-btn"
        @click="toggleSmartZoneMode"
      >
        {{ $t('geozone.smartZone') }}
      </v-btn>

      <v-btn
        v-if="isDrawingActive"
        v-tooltip:bottom="$t('geozone.deletePolygonDesc')"
        color="error"
        variant="tonal"
        prepend-icon="mdi-delete"
        class="delete-btn"
        @click="deletePolygon"
      >
        {{ $t('geozone.deletePolygon') }}
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeoZoneStore } from '@/stores/geozones'
import { useUIStore } from '@/stores/ui'

const emit = defineEmits(['activate-polygon-drawing', 'mapbox-draw-delete'])

const geoZoneStore = useGeoZoneStore()
const uiStore = useUIStore()

const isDrawingActive = ref(false)

const cancelEditMode = () => {
  geoZoneStore.exitEditMode()
  uiStore.setEditMode(false)
}

const toggleSmartZoneMode = () => {
  if (geoZoneStore.isDrawMode) {
    geoZoneStore.toggleDrawMode()
    isDrawingActive.value = false
  }
  geoZoneStore.toggleSmartZoneMode()
}

const toggleDrawPolygon = () => {
  if (geoZoneStore.isSmartZoneMode) {
    geoZoneStore.toggleSmartZoneMode()
  }

  if (!geoZoneStore.isDrawMode) {
    geoZoneStore.toggleDrawMode()
  }

  isDrawingActive.value = true

  emit('activate-polygon-drawing')
}

const deletePolygon = () => {
  emit('mapbox-draw-delete')
}

watch(
  () => geoZoneStore.isDrawMode,
  (newValue) => {
    isDrawingActive.value = newValue
  },
)
</script>

<style lang="scss" scoped>
.edit-mode-controls {
  position: absolute;
  top: 16px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1000;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  padding: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 250px;
  max-width: 40%;

  @media (max-width: 768px) {
    min-width: 0;
    max-width: 90%;
    width: calc(100% - 32px);
    padding: 12px;
    top: 10px;
  }
}

.edit-mode-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  margin-bottom: 16px;
  position: relative;

  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
  }

  .edit-mode-body {
    margin-top: 12px;
    text-align: center;
    font-size: 14px;
  }

  .edit-mode-desc {
    font-size: 0.9rem;
    color: rgba(0, 0, 0, 0.6);
    margin-top: 4px;
    text-align: center;
  }

  .cancel-btn {
    position: absolute;
    top: -8px;
    right: -8px;
  }
}

.edit-mode-actions {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.draw-btn,
.smart-zone-btn,
.delete-btn {
  margin-top: 8px;
  position: relative;
}
</style>
