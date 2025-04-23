import { ref, watch } from 'vue'
import type { Ref } from 'vue'
import mapboxgl from 'mapbox-gl'
import type { LngLatLike } from 'mapbox-gl'
import type { Tracker } from '@/types'
import { trackerApi } from '@/api/TrackerApi'

export function useMovingTracker(
  map: Ref<any>,
  trackers: Ref<Tracker[]>,
  updateTrackerPosition: (
    id: string,
    position: { lat: number; lng: number; speed?: number },
  ) => void,
  onTrackerClick: (trackerId: string) => void,
) {
  const movingTracker = ref<{
    id: string
    name: string
    route: Array<[number, number, number, string]>
    currentIndex: number
  }>({
    id: '',
    name: '',
    route: [],
    currentIndex: 0,
  })
  const movingTrackerMarker = ref<mapboxgl.Marker | null>(null)
  const trailMarkers = ref<mapboxgl.Marker[]>([])
  const animationFrameId = ref<number | null>(null)

  const setupMovingTracker = async () => {
    if (!map.value) return

    const movingTrackerData = trackers.value.find((t) => t.state === 'moving')
    if (!movingTrackerData) return

    const routeData = await trackerApi.getMovingTrackerRoute()
    movingTracker.value = {
      id: movingTrackerData.id,
      name: movingTrackerData.name,
      route: routeData,
      currentIndex: 0,
    }

    const el = document.createElement('div')
    el.className = 'tracker-marker moving'
    el.innerHTML = `
      <div class="tracker-icon moving" style="background-color: ${movingTrackerData.color || '#03A9F4'}"></div>
      <div class="tracker-label">
        ${movingTrackerData.name}
        <span class="tracker-speed" id="moving-tracker-speed">${movingTrackerData.speed || 0} km/h</span>
      </div>
    `

    const initialPos = routeData[0]
    movingTrackerMarker.value = new mapboxgl.Marker(el)
      .setLngLat([initialPos[0], initialPos[1]] as LngLatLike)
      .addTo(map.value as any)

    el.addEventListener('click', () => {
      onTrackerClick(movingTrackerData.id)
    })

    animateMovingTracker()
  }

  const calculateDistance = (point1: [number, number], point2: [number, number]): number => {
    const R = 6371
    const dLat = ((point2[1] - point1[1]) * Math.PI) / 180
    const dLon = ((point2[0] - point1[0]) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((point1[1] * Math.PI) / 180) *
        Math.cos((point2[1] * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c
  }

  const animateMovingTracker = () => {
    if (!map.value || !movingTracker.value || !movingTrackerMarker.value) return

    const route = movingTracker.value.route
    let currentIndex = movingTracker.value.currentIndex
    let lastTimestamp = 0
    let accumulatedTime = 0
    let isReversed = false
    const POINT_DURATION = 8000

    const speedElement = document.getElementById('moving-tracker-speed')

    const animate = (timestamp: number) => {
      if (!lastTimestamp) {
        lastTimestamp = timestamp
        animationFrameId.value = requestAnimationFrame(animate)
        return
      }

      const deltaTime = timestamp - lastTimestamp
      lastTimestamp = timestamp
      accumulatedTime += deltaTime

      const currentPoint = route[currentIndex]
      let nextPoint

      if (isReversed) {
        nextPoint = route[currentIndex - 1]
      } else {
        nextPoint = route[currentIndex + 1]
      }

      if (!nextPoint) {
        isReversed = !isReversed

        if (isReversed) {
          currentIndex = route.length - 1
          nextPoint = route[currentIndex - 1]
        } else {
          currentIndex = 0
          nextPoint = route[currentIndex + 1]
        }

        movingTracker.value.currentIndex = currentIndex
        accumulatedTime = 0
        animationFrameId.value = requestAnimationFrame(animate)
        return
      }

      const progress = Math.min(accumulatedTime / POINT_DURATION, 1)

      const lng = currentPoint[0] + (nextPoint[0] - currentPoint[0]) * progress
      const lat = currentPoint[1] + (nextPoint[1] - currentPoint[1]) * progress

      const distance = calculateDistance(
        [currentPoint[0], currentPoint[1]],
        [nextPoint[0], nextPoint[1]],
      )

      const durationInHours = POINT_DURATION / 3600000
      const speed = Math.min(Math.round(distance / durationInHours), 60)

      movingTrackerMarker.value?.setLngLat([lng, lat])

      updateTrackerPosition(movingTracker.value.id, { lat, lng, speed })

      if (speedElement) {
        speedElement.textContent = `${speed} km/h`
      }

      if (progress >= 1) {
        if (isReversed) {
          currentIndex--
        } else {
          currentIndex++
        }
        movingTracker.value.currentIndex = currentIndex
        accumulatedTime = 0
      }

      animationFrameId.value = requestAnimationFrame(animate)
    }

    animationFrameId.value = requestAnimationFrame(animate)
  }

  const followMovingTracker = (isFollowing: Ref<boolean>) => {
    if (!map.value || !isFollowing.value) return

    const tracker = trackers.value.find((t) => t.id === movingTracker.value.id)
    if (!tracker || tracker.state !== 'moving') {
      isFollowing.value = false
      return
    }

    map.value.setCenter([tracker.coordinates.lng, tracker.coordinates.lat])

    requestAnimationFrame(() => followMovingTracker(isFollowing))
  }

  const cleanupMovingTracker = () => {
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value)
    }
    if (movingTrackerMarker.value) movingTrackerMarker.value.remove()
    trailMarkers.value.forEach((marker) => marker.remove())
  }

  watch(
    () => {
      const movingTrackerData = trackers.value.find((t) => t.state === 'moving')
      return movingTrackerData ? { id: movingTrackerData.id, color: movingTrackerData.color } : null
    },
    (newValue) => {
      if (newValue && movingTrackerMarker.value) {
        const el = movingTrackerMarker.value.getElement()
        const iconEl = el.querySelector('.tracker-icon')
        if (iconEl) {
          ;(iconEl as HTMLElement).style.backgroundColor = newValue.color || '#03A9F4'
        }
      }
    },
    { deep: true },
  )

  return {
    movingTracker,
    movingTrackerMarker,
    setupMovingTracker,
    followMovingTracker,
    cleanupMovingTracker,
  }
}
