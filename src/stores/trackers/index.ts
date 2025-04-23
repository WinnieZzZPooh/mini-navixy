import { defineStore } from 'pinia'
import { ref, computed, nextTick } from 'vue'
import { trackerApi } from '@/api/TrackerApi'
import type { Tracker } from '@/types'
import { useLoadingState } from '@/composables/store/useLoadingState'

export const useTrackerStore = defineStore('tracker', () => {
  const trackers = ref<Tracker[]>([])
  const selectedTrackerId = ref<string | null>(null)
  const { isLoading, withLoading } = useLoadingState()
  const isFollowingTracker = ref(false)

  const fetchTrackers = async () => {
    return withLoading(async () => {
      try {
        trackers.value = await trackerApi.getTrackers()
      } catch (error) {
        console.error('Error fetching trackers:', error)
      }
    })
  }

  const selectTracker = (id: string) => {
    selectedTrackerId.value = null

    if (isFollowingTracker.value) {
      toggleFollowTracker()
    }

    nextTick(() => (selectedTrackerId.value = id))
  }

  const selectedTracker = computed(() =>
    trackers.value.find((tracker) => tracker.id === selectedTrackerId.value),
  )

  const updateMovingTrackerPosition = (
    id: string,
    coordinates: { lat: number; lng: number; speed?: number },
  ) => {
    const tracker = trackers.value.find((t) => t.id === id)
    if (tracker) {
      tracker.coordinates = { lat: coordinates.lat, lng: coordinates.lng }
      tracker.speed = coordinates.speed
      tracker.lastUpdate = new Date().toISOString()
    }
  }

  const updateTrackerColor = (id: string, color: string) => {
    const tracker = trackers.value.find((t) => t.id === id)
    if (tracker) {
      tracker.color = color
    }
  }

  const updateTrackerPhoto = (id: string, photo: string) => {
    const tracker = trackers.value.find((t) => t.id === id)
    if (tracker) {
      tracker.photo = photo
    }
  }

  const removeTrackerPhoto = (id: string) => {
    const tracker = trackers.value.find((t) => t.id === id)
    if (tracker) {
      tracker.photo = null
    }
  }

  const toggleFollowTracker = () => {
    isFollowingTracker.value = !isFollowingTracker.value
  }

  return {
    trackers,
    selectedTrackerId,
    selectedTracker,
    isLoading,
    isFollowingTracker,
    fetchTrackers,
    selectTracker,
    updateMovingTrackerPosition,
    updateTrackerColor,
    updateTrackerPhoto,
    removeTrackerPhoto,
    toggleFollowTracker,
  }
})
