import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { geoZoneApi } from '@/api/GeoZoneApi.ts'
import type { GeoZone } from '@/types'

import { useLoadingState } from '@/composables/store/useLoadingState'

export const useGeoZoneStore = defineStore('geozone', () => {
  const geoZones = ref<GeoZone[]>([])
  const selectedGeoZoneId = ref<string | null>(null)
  const { isLoading, withLoading } = useLoadingState()
  const isDrawMode = ref(false)
  const isSmartZoneMode = ref(false)
  const tempGeoZone = ref<GeoZone | null>(null)

  const fetchGeoZones = async () => {
    return withLoading(async () => {
      try {
        geoZones.value = await geoZoneApi.getGeoZones()
      } catch (error) {
        console.error('Error fetching geozones:', error)
      }
    })
  }

  const selectGeoZone = (id: string) => {
    selectedGeoZoneId.value = id
    toggleGeoZoneVisibility(id, true)
  }

  const selectedGeoZone = computed(() =>
    geoZones.value.find((geoZone) => geoZone.id === selectedGeoZoneId.value),
  )

  const toggleGeoZoneVisibility = (id: string, forceVisible: boolean = false) => {
    const geoZone = geoZones.value.find((gz) => gz.id === id)
    if (geoZone) {
      geoZone.visible = forceVisible || !geoZone.visible
    }
  }

  const deleteGeoZone = (id: string) => {
    geoZones.value = geoZones.value.filter((gz) => gz.id !== id)
    if (selectedGeoZoneId.value === id) {
      selectedGeoZoneId.value = null
    }
  }

  const addGeoZone = (geoZone: GeoZone) => {
    geoZones.value.push(geoZone)
  }

  const saveTempGeoZone = (geoZone: GeoZone) => {
    tempGeoZone.value = geoZone
  }

  const confirmGeoZone = (name: string) => {
    if (tempGeoZone.value) {
      tempGeoZone.value.name = name
      addGeoZone(tempGeoZone.value)
      selectGeoZone(tempGeoZone.value.id)
      tempGeoZone.value = null
    }
  }

  const toggleDrawMode = () => {
    isDrawMode.value = !isDrawMode.value
    if (isDrawMode.value) {
      isSmartZoneMode.value = false
    }
  }

  const toggleSmartZoneMode = () => {
    isSmartZoneMode.value = !isSmartZoneMode.value
    if (isSmartZoneMode.value) {
      isDrawMode.value = false
    }
  }

  const exitEditMode = () => {
    isDrawMode.value = false
    isSmartZoneMode.value = false
    tempGeoZone.value = null
  }

  return {
    geoZones,
    selectedGeoZoneId,
    selectedGeoZone,
    isLoading,
    isDrawMode,
    isSmartZoneMode,
    tempGeoZone,
    fetchGeoZones,
    selectGeoZone,
    toggleGeoZoneVisibility,
    deleteGeoZone,
    addGeoZone,
    saveTempGeoZone,
    confirmGeoZone,
    toggleDrawMode,
    toggleSmartZoneMode,
    exitEditMode,
  }
})
