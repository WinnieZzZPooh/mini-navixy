<template>
  <div class="task-item" :class="{ selected: isSelected }" @click="$emit('click')">
    <div class="task-info">
      <div class="task-name">{{ task.name }}</div>
      <div v-if="task.comment" class="task-comment">{{ task.comment }}</div>
    </div>

    <div v-if="task.required" class="task-status" :class="{ required: task.required }">
      <v-icon v-tooltip="$t('task.required')" size="small">mdi-alert-circle</v-icon>
    </div>

    <v-btn
      icon
      size="small"
      variant="text"
      color="primary"
      @click.stop="$emit('view-details')"
      class="view-btn"
      v-tooltip="$t('task.viewDetails')"
    >
      <v-icon size="small">mdi-eye</v-icon>
    </v-btn>

    <v-btn
      icon
      size="small"
      variant="text"
      color="error"
      @click.stop="confirmDelete"
      class="delete-btn"
    >
      <v-icon v-tooltip="$t('task.delete')" size="small">mdi-delete</v-icon>
    </v-btn>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import { useI18n } from 'vue-i18n'
import { useTaskStore } from '@/stores/tasks'
import type { Task } from '@/types'

const taskStore = useTaskStore()
const { t } = useI18n()

const props = defineProps<{
  task: Task
  isSelected: boolean
}>()

defineEmits<{
  (e: 'click'): void
  (e: 'view-details'): void
}>()

const confirmDelete = (event: Event) => {
  event.stopPropagation()
  if (confirm(t('task.deleteConfirm'))) {
    taskStore.deleteTask(props.task.id)
  }
}
</script>

<style lang="scss" scoped>
.task-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-left: 3px solid transparent;
  margin: 4px 8px;
  border-radius: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background-color: rgba(25, 118, 210, 0.08);
    border-left-color: #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .task-info {
    flex: 1;
    min-width: 0;

    .task-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
      font-size: 0.95rem;
    }

    .task-comment {
      font-size: 0.75rem;
      padding: 2px 6px;
      background-color: rgba(0, 0, 0, 0.05);
      border-radius: 4px;
      color: rgba(0, 0, 0, 0.6);
      display: inline-block;
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .task-status {
    margin-left: 12px;
    margin-right: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;

    &.required {
      color: #f39c12;
    }

    &:not(.required) {
      color: #95a5a6;
    }
  }

  .delete-btn {
    opacity: 0.7;

    &:hover {
      opacity: 1;
    }
  }
}
</style>
