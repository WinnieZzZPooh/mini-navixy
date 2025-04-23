<template>
  <transition name="panel" @before-enter="beforeEnter" @enter="onEnter" @leave="onLeave">
    <div class="geozone-list" v-if="uiStore.isGeoZoneListOpen && !uiStore.isEditMode">
      <div class="geozone-list-header">
        <h2 class="geozone-list-title">{{ $t('geozone.title') }}</h2>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          @click="uiStore.toggleGeoZoneList"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="geozone-list-content">
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

        <div class="geozones-container" ref="geoZonesContainer">
          <GeoZoneItem
            v-for="geoZone in filteredGeoZones"
            :key="geoZone.id"
            :geoZone="geoZone"
            :is-selected="geoZoneStore.selectedGeoZoneId === geoZone.id"
            @click="handleGeoZoneClick(geoZone.id)"
            @delete="handleDeleteGeoZone(geoZone.id)"
            @visibility-toggle="handleVisibilityToggle(geoZone.id)"
            ref="geoZoneItems"
          />

          <div v-if="filteredGeoZones.length === 0" class="no-geozones">
            {{ $t('geozone.noGeozones') }}
          </div>
        </div>

        <div class="add-geozone-container">
          <v-btn
            block
            color="primary"
            prepend-icon="mdi-plus"
            @click="handleAddGeoZone"
            class="add-geozone-btn"
            height="44px"
            border-radius="8px"
          >
            {{ $t('geozone.add') }}
          </v-btn>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { storeToRefs } from 'pinia'
import { useGeoZoneStore } from '@/stores/geozones'
import { useUIStore } from '@/stores/ui'
import { useCustomAnimation } from '@/composables/ui/useCustomAnimation'
import GeoZoneItem from './GeoZoneItem.vue'

const { t } = useI18n()

const emit = defineEmits<{
  (e: 'geozone-click', geoZoneId: string): void
}>()

const geoZoneStore = useGeoZoneStore()
const uiStore = useUIStore()

const { geoZones } = storeToRefs(geoZoneStore)

const { rightPanelAnimation } = useCustomAnimation()
const { beforeEnter, onEnter, onLeave } = rightPanelAnimation

const searchQuery = ref('')
const geoZonesContainer = ref<HTMLElement | null>(null)

const filteredGeoZones = computed(() => {
  if (!searchQuery.value) return geoZones.value

  const query = searchQuery.value.toLowerCase()
  return geoZones.value.filter((geoZone) => geoZone.name.toLowerCase().includes(query))
})

const handleGeoZoneClick = (geoZoneId: string) => {
  geoZoneStore.selectGeoZone(geoZoneId)
  emit('geozone-click', geoZoneId)
  if (window.innerWidth <= 768) {
    uiStore.toggleGeoZoneList()
  }
}

const handleDeleteGeoZone = (geoZoneId: string) => {
  if (confirm(t('geozone.deleteConfirm'))) {
    geoZoneStore.deleteGeoZone(geoZoneId)
  }
}

const handleVisibilityToggle = (geoZoneId: string) => {
  geoZoneStore.toggleGeoZoneVisibility(geoZoneId)
}

const handleAddGeoZone = () => {
  geoZoneStore.toggleDrawMode()
  uiStore.toggleGeoZoneList()
  uiStore.setEditMode(true)
}

defineExpose({
  scrollToGeoZone: (geoZoneId: string) => {
    handleGeoZoneClick(geoZoneId)
  },
})
</script>

<style lang="scss" scoped>
.geozone-list {
  position: absolute;
  top: 90px;
  right: 16px;
  width: 320px;
  max-height: calc(100vh - 110px);
  background-color: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 5;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  @media (max-width: 768px) {
    width: calc(100% - 20px);
    right: 10px;
    top: 90px;
    max-height: calc(100vh - 140px);
  }

  .geozone-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .geozone-list-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .close-btn {
      transition: all 0.3s ease;
    }
  }

  .geozone-list-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .search-container {
      padding: 12px 16px;
      border-bottom: 1px solid rgba(0, 0, 0, 0.05);
    }

    .geozones-container {
      flex: 1;
      max-height: calc(100vh - 250px);
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

      .no-geozones {
        padding: 20px;
        text-align: center;
        color: rgba(0, 0, 0, 0.5);
        font-style: italic;
      }
    }

    .add-geozone-container {
      padding: 12px 16px 16px;

      .add-geozone-btn {
        transition: all 0.3s ease;

        &:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
        }
      }
    }
  }
}
</style>
