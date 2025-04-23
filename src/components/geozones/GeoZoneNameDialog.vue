<template>
  <v-dialog v-model="dialog" max-width="400" persistent>
    <v-card>
      <v-card-title>{{ $t('geozone.enterName') }}</v-card-title>
      <v-card-text>
        <v-text-field
          v-model="geoZoneName"
          :label="$t('geozone.name')"
          required
          autofocus
          variant="outlined"
        ></v-text-field>
      </v-card-text>
      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn color="error" text @click="close">{{ $t('common.cancel') }}</v-btn>
        <v-btn color="primary" @click="save" :disabled="!geoZoneName">{{
          $t('common.save')
        }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useGeoZoneStore } from '@/stores/geozones'
import { useUIStore } from '@/stores/ui'

const geoZoneStore = useGeoZoneStore()
const uiStore = useUIStore()

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
}>()

const dialog = ref(props.modelValue)
const geoZoneName = ref('')

watch(
  () => props.modelValue,
  (value) => {
    dialog.value = value
    if (value) {
      geoZoneName.value = ''
    }
  },
)

watch(dialog, (value) => {
  emit('update:modelValue', value)
})

const save = () => {
  geoZoneStore.confirmGeoZone(geoZoneName.value)
  close()
}

const close = () => {
  geoZoneStore.exitEditMode()
  uiStore.setEditMode(false)
  dialog.value = false
}
</script>
