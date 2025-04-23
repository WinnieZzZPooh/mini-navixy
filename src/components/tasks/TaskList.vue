<template>
  <transition name="panel" @before-enter="beforeEnter" @enter="onEnter" @leave="onLeave">
    <div class="task-list" v-if="uiStore.isTaskListOpen && !uiStore.isEditMode">
      <div class="task-list-header">
        <h2 class="task-list-title">{{ $t('task.title') }}</h2>
        <v-btn
          icon
          variant="text"
          density="comfortable"
          @click="uiStore.toggleTaskList"
          class="close-btn"
        >
          <v-icon>mdi-close</v-icon>
        </v-btn>
      </div>

      <div class="task-list-content">
        <div class="tasks-container" ref="tasksContainer">
          <task-item
            v-for="task in tasks"
            :key="task.id"
            :task="task"
            :is-selected="taskStore.selectedTaskId === task.id"
            @click="handleTaskClick(task.id)"
            @view-details="handleViewDetails(task.id)"
          />

          <div v-if="tasks.length === 0" class="no-tasks">
            {{ $t('task.noTasks') }}
          </div>
        </div>

        <div class="task-list-actions">
          <v-btn
            block
            color="primary"
            prepend-icon="mdi-plus"
            @click="openAddTaskForm"
            class="add-task-btn"
          >
            {{ $t('task.add') }}
          </v-btn>
        </div>
      </div>
    </div>
  </transition>

  <task-form v-model="showTaskForm" @task-added="handleTaskAdded" />

  <v-dialog v-model="showTaskDetails" max-width="600">
    <task-preview
      v-if="selectedTask"
      :task-data="selectedTask"
      :show-details-mode="true"
      @close="showTaskDetails = false"
    />
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useTaskStore } from '@/stores/tasks'
import { useUIStore } from '@/stores/ui'
import { useCustomAnimation } from '@/composables/ui/useCustomAnimation'
import TaskItem from './TaskItem.vue'
import TaskForm from './TaskForm.vue'
import TaskPreview from './TaskPreview.vue'
import type { Task } from '@/types'

const emit = defineEmits<{
  (e: 'task-added', taskId: string): void
  (e: 'task-click', taskId: string): void
}>()

const taskStore = useTaskStore()
const uiStore = useUIStore()

const { rightPanelAnimation } = useCustomAnimation()
const { beforeEnter, onEnter, onLeave } = rightPanelAnimation

const tasksContainer = ref<HTMLElement | null>(null)
const showTaskForm = ref(false)
const showTaskDetails = ref(false)
const selectedTask = ref<Task | null>(null)

const tasks = computed(() => taskStore.tasks)

onMounted(async () => {
  await taskStore.fetchTasks()
})

const openAddTaskForm = () => {
  showTaskForm.value = true
}

const handleTaskAdded = (taskId: string) => {
  emit('task-added', taskId)
}

const handleTaskClick = (taskId: string) => {
  taskStore.selectTask(taskId)
  emit('task-click', taskId)
  if (window.innerWidth <= 768) {
    uiStore.toggleTaskList()
  }
}

const handleViewDetails = (taskId: string) => {
  selectedTask.value = tasks.value.find((t) => t.id === taskId) || null
  showTaskDetails.value = true
}

defineExpose({
  openAddTaskForm,
})
</script>

<style lang="scss" scoped>
.task-list {
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
    max-height: calc(100vh - 180px);
  }

  .task-list-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 16px;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);

    .task-list-title {
      margin: 0;
      font-size: 1.1rem;
      font-weight: 500;
    }

    .close-btn {
      transition: all 0.3s ease;
    }
  }

  .task-list-content {
    display: flex;
    flex-direction: column;
    flex: 1;
    overflow: hidden;

    .tasks-container {
      max-height: calc(100vh - 200px);
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

      .no-tasks {
        padding: 20px;
        text-align: center;
        color: rgba(0, 0, 0, 0.5);
        font-style: italic;
      }
    }

    .task-list-actions {
      padding: 12px 16px 16px;

      .add-task-btn {
        border-radius: 8px;
        height: 44px;
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
