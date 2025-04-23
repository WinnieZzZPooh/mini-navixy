import type { Ref } from 'vue'
import { ref, watch } from 'vue'
import type { LngLatLike } from 'mapbox-gl'
import mapboxgl from 'mapbox-gl'
import type { Tracker } from '@/types'

export function useTrackerMarkers(
  map: Ref<any>,
  trackers: Ref<Tracker[]>,
  onTrackerClick: (trackerId: string) => void,
) {
  const markers = ref<{ [key: string]: mapboxgl.Marker }>({})

  const addMarkersToMap = () => {
    if (!map.value) return

    trackers.value.forEach((tracker) => {
      if (tracker.state === 'moving') return // Скипаем moving маячок, он будет обработан отдельно

      const el = document.createElement('div')
      el.className = 'tracker-marker'

      const iconStyle = tracker.photo
        ? `background-image: url(${tracker.photo}); background-size: cover; background-position: center;`
        : `background-color: ${tracker.color || (tracker.status === 'online' ? '#2ecc71' : '#e74c3c')};`

      el.innerHTML = `
        <div class="tracker-icon ${tracker.state}" style="${iconStyle}"></div>
        <div class="tracker-label">${tracker.name}</div>
      `

      markers.value[tracker.id] = new mapboxgl.Marker(el)
        .setLngLat([tracker.coordinates.lng, tracker.coordinates.lat] as LngLatLike)
        .addTo(map.value as any)

      el.addEventListener('click', () => {
        onTrackerClick(tracker.id)
      })
    })
  }

  const updateMarkerColors = () => {
    trackers.value.forEach((tracker) => {
      const marker = markers.value[tracker.id]
      if (marker) {
        const el = marker.getElement()
        const iconEl = el.querySelector('.tracker-icon')
        if (iconEl) {
          if (tracker.photo) {
            const style = `
              background-image: url(${tracker.photo});
              background-size: cover;
              background-position: center;
              background-color: transparent;
            `
            iconEl.setAttribute('style', style)
          } else {
            const backgroundColor =
              tracker.color || (tracker.status === 'online' ? '#2ecc71' : '#e74c3c')
            iconEl.setAttribute(
              'style',
              `background-color: ${backgroundColor}; background-image: none;`,
            )
          }
        }
      }
    })
  }

  const cleanupMarkers = () => {
    Object.values(markers.value).forEach((marker) => marker.remove())
    markers.value = {}
  }

  watch(
    trackers,
    () => {
      updateMarkerColors()
    },
    { deep: true },
  )

  return {
    markers,
    addMarkersToMap,
    updateMarkerColors,
    cleanupMarkers,
  }
}
