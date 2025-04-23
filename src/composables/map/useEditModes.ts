import { watch } from 'vue'
import type { Ref } from 'vue'
import type { GeoZone } from '@/types'

export function useEditModes(
  map: Ref<any>,
  draw: Ref<any | null>,
  geocoder: Ref<any | null>,
  isDrawMode: Ref<boolean>,
  isSmartZoneMode: Ref<boolean>,
  onSaveDrawnGeoZone: (geoZone: GeoZone) => void,
  onShowNameDialog: () => void,
) {
  let drawModeActive = false
  let smartZoneModeActive = false
  let geocoderListenerAdded = false

  const createGeoZone = (
    coordinates: Array<[number, number]>,
    name: string = '',
    isSmartZone: boolean = false,
  ): GeoZone => {
    return {
      id: `gz-${Date.now()}`,
      name,
      coordinates,
      visible: true,
      color: isSmartZone ? 'rgba(76, 175, 80, 0.3)' : 'rgba(33, 150, 243, 0.3)',
      borderColor: isSmartZone ? 'rgba(76, 175, 80, 0.8)' : 'rgba(33, 150, 243, 0.8)',
      createdAt: new Date().toISOString(),
    }
  }

  const saveDrawnGeoZone = () => {
    if (!draw.value || !isDrawMode.value) return

    const data = draw.value.getAll()
    if (data.features.length > 0) {
      const polygon = data.features[0]

      if (polygon.geometry.type === 'Polygon') {
        const coordinates = polygon.geometry.coordinates[0].map(
          (coord: [number, number]) => [coord[0], coord[1]] as [number, number],
        )

        const newGeoZone = createGeoZone(coordinates)

        onSaveDrawnGeoZone(newGeoZone)
        draw.value.deleteAll()
        onShowNameDialog()
      }
    }
  }

  const handleDrawMode = () => {
    if (!map.value || !draw.value) return

    if (isDrawMode.value) {
      if (!drawModeActive) {
        map.value.addControl(draw.value)

        const drawControlButtons = document.querySelectorAll(
          '.mapboxgl-ctrl-top-right .mapboxgl-ctrl-group .mapbox-gl-draw_ctrl-draw-btn',
        )
        if (drawControlButtons.length > 0) {
          drawControlButtons.forEach((button) => {
            ;(button as HTMLElement).style.display = 'none'
          })
        }

        drawModeActive = true
      }
    } else {
      if (drawModeActive) {
        try {
          if (map.value && map.value.getStyle() && draw.value) {
            map.value.removeControl(draw.value)
          }
        } catch (error) {
          console.error('Error removing draw control:', error)
        }

        drawModeActive = false
      }

      const drawModeNotice = document.querySelector('.draw-mode-notice')
      if (drawModeNotice) {
        drawModeNotice.remove()
      }

      const smartZoneBtn = document.querySelector('.smart-zone-btn')
      if (smartZoneBtn) {
        smartZoneBtn.remove()
      }
    }
  }

  const handleSmartZoneMode = () => {
    if (!map.value || !geocoder.value) return

    if (isSmartZoneMode.value) {
      if (!smartZoneModeActive) {
        map.value.addControl(geocoder.value)
        smartZoneModeActive = true

        if (!geocoderListenerAdded) {
          geocoderListenerAdded = true

          geocoder.value.on('result', (e: any) => {
            if (e.result && e.result.bbox) {
              const [minLng, minLat, maxLng, maxLat] = e.result.bbox

              const coordinates: Array<[number, number]> = [
                [minLng, minLat],
                [maxLng, minLat],
                [maxLng, maxLat],
                [minLng, maxLat],
                [minLng, minLat],
              ]

              const newGeoZone = createGeoZone(
                coordinates,
                e.result.place_name || 'Smart Zone',
                true, // isSmartZone = true
              )

              onSaveDrawnGeoZone(newGeoZone)
            }
          })
        }
      }
    } else {
      if (smartZoneModeActive) {
        try {
          if (map.value && map.value.getStyle() && geocoder.value) {
            map.value.removeControl(geocoder.value)
          }
        } catch (error) {
          console.error('Error removing geocoder control:', error)
        }

        smartZoneModeActive = false
      }
    }
  }

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

  const setupDrawEvents = () => {
    if (!map.value) return

    map.value.off('draw.create', saveDrawnGeoZone)
    map.value.off('draw.update', saveDrawnGeoZone)

    map.value.on('draw.create', saveDrawnGeoZone)
    map.value.on('draw.update', saveDrawnGeoZone)
  }

  return {
    setupDrawEvents,
    handleDrawMode,
    handleSmartZoneMode,
  }
}
