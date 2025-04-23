import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const isSidebarOpen = ref(true)
  const isGeoZoneListOpen = ref(false)
  const isTaskListOpen = ref(false)
  const is3DMode = ref(false)
  const isEditMode = ref(false)
  const isTrackerInfoPanelOpen = ref(false)

  const toggleSidebar = () => {
    isSidebarOpen.value = !isSidebarOpen.value
    if (isSidebarOpen.value) {
      isGeoZoneListOpen.value = false
      isTaskListOpen.value = false
    }
    closeTrackerInfoPanel()
  }

  const toggleGeoZoneList = () => {
    isGeoZoneListOpen.value = !isGeoZoneListOpen.value
    isTaskListOpen.value = false
  }

  const toggleTaskList = () => {
    isTaskListOpen.value = !isTaskListOpen.value
    isGeoZoneListOpen.value = false
  }

  const toggle3DMode = () => {
    is3DMode.value = !is3DMode.value
  }

  const setEditMode = (value: boolean) => {
    isEditMode.value = value
    if (value) {
      isSidebarOpen.value = false
      isGeoZoneListOpen.value = false
      isTaskListOpen.value = false
    }
  }

  const openTrackerInfoPanel = () => {
    isTrackerInfoPanelOpen.value = true
  }

  const closeTrackerInfoPanel = () => {
    isTrackerInfoPanelOpen.value = false
  }

  return {
    isSidebarOpen,
    isGeoZoneListOpen,
    isTaskListOpen,
    is3DMode,
    isEditMode,
    isTrackerInfoPanelOpen,
    toggleSidebar,
    toggleGeoZoneList,
    toggleTaskList,
    toggle3DMode,
    setEditMode,
    openTrackerInfoPanel,
    closeTrackerInfoPanel,
  }
})
