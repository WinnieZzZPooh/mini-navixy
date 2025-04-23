<template>
  <div class="geozone-item" :class="{ selected: isSelected }" @click="$emit('click')">
    <div
      class="geozone-icon"
      :style="{ backgroundColor: geoZone.color, borderColor: geoZone.borderColor }"
    ></div>
    <div class="geozone-info">
      <div class="geozone-name">{{ geoZone.name }}</div>
      <div class="geozone-date">{{ formatDate(geoZone.createdAt) }}</div>
    </div>

    <div class="geozone-actions">
      <v-btn
        icon
        size="small"
        variant="text"
        :color="geoZone.visible ? 'primary' : ''"
        @click.stop="toggleVisibility"
        class="visibility-btn"
      >
        <v-tooltip activator="parent" location="start">
          {{ geoZone.visible ? $t('geozone.hide') : $t('geozone.show') }}
        </v-tooltip>
        <v-icon size="small">{{ geoZone.visible ? 'mdi-eye' : 'mdi-eye-off' }}</v-icon>
      </v-btn>

      <v-btn
        icon
        size="small"
        variant="text"
        color="error"
        @click.stop="$emit('delete')"
        class="delete-btn"
      >
        <v-tooltip activator="parent" location="start">
          {{ $t('geozone.delete') }}
        </v-tooltip>
        <v-icon size="small">mdi-delete</v-icon>
      </v-btn>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'
import type { GeoZone } from '@/types'

defineProps<{
  geoZone: GeoZone
  isSelected: boolean
}>()

const emit = defineEmits<{
  (e: 'click'): void
  (e: 'delete'): void
  (e: 'visibility-toggle'): void
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString()
}

const toggleVisibility = (event: Event) => {
  event.stopPropagation()
  emit('visibility-toggle')
}
</script>

<style lang="scss" scoped>
.geozone-item {
  display: flex;
  align-items: center;
  padding: 14px 16px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1);
  border-right: 3px solid transparent;
  margin: 4px 8px;
  border-radius: 8px;

  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  &.selected {
    background-color: rgba(25, 118, 210, 0.08);
    border-right-color: #1976d2;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .geozone-icon {
    width: 16px;
    height: 16px;
    border-radius: 4px;
    margin-right: 14px;
    position: relative;
    border: 1px solid;

    &:after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 6px;
      height: 6px;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 50%;
      transform: translate(-50%, -50%);
    }
  }

  .geozone-info {
    flex: 1;
    min-width: 0;

    .geozone-name {
      font-weight: 500;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      margin-bottom: 4px;
      font-size: 0.95rem;
    }

    .geozone-date {
      font-size: 0.75rem;
      color: rgba(0, 0, 0, 0.6);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      transition: all 0.3s ease;
    }
  }

  .geozone-actions {
    display: flex;
    align-items: center;
    gap: 4px;

    .visibility-btn,
    .delete-btn {
      width: 24px;
      height: 24px;
      opacity: 0.7;

      &:hover {
        opacity: 1;
      }
    }
  }
}
</style>
