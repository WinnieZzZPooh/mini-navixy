import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Task } from '@/types'
import { taskApi } from '@/api/TaskApi'
import { useLoadingState } from '@/composables/store/useLoadingState'

export const useTaskStore = defineStore('task', () => {
  const tasks = ref<Task[]>([])
  const selectedTaskId = ref<string | null>(null)
  const { isLoading, withLoading } = useLoadingState()

  const fetchTasks = async () => {
    return withLoading(async () => {
      try {
        tasks.value = await taskApi.getTasks()
      } catch (error) {
        console.error('Error fetching tasks:', error)
      }
    })
  }

  const selectTask = (id: string) => {
    selectedTaskId.value = id
  }

  const selectedTask = computed(() => tasks.value.find((task) => task.id === selectedTaskId.value))

  const deleteTask = (id: string) => {
    tasks.value = tasks.value.filter((task) => task.id !== id)
    if (selectedTaskId.value === id) {
      selectedTaskId.value = null
    }
  }

  const addTask = (task: Task) => {
    tasks.value.push(task)
    selectTask(task.id)
    return task
  }

  const isTrackerAssigned = (trackerId: string) => {
    return tasks.value.some((task) => task.trackerId === trackerId && task.required)
  }

  const getAssignedTrackers = () => {
    return tasks.value.filter((task) => task.required).map((task) => task.trackerId)
  }

  const getAvailableTrackers = (allTrackerIds: string[]) => {
    const assignedTrackers = getAssignedTrackers()
    return allTrackerIds.filter((id) => !assignedTrackers.includes(id))
  }

  return {
    tasks,
    selectedTaskId,
    selectedTask,
    isLoading,
    fetchTasks,
    selectTask,
    deleteTask,
    addTask,
    isTrackerAssigned,
    getAssignedTrackers,
    getAvailableTrackers,
  }
})
