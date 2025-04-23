import { watch } from 'vue'
import type { Ref } from 'vue'

export function use3DMode(map: Ref<any>, is3DMode: Ref<boolean>) {
  const add3DBuildingsLayer = () => {
    if (!map.value || map.value.getLayer('3d-buildings')) return

    map.value.addLayer({
      id: '3d-buildings',
      source: 'composite',
      'source-layer': 'building',
      filter: ['==', 'extrude', 'true'],
      type: 'fill-extrusion',
      minzoom: 15,
      paint: {
        'fill-extrusion-color': '#aaa',
        'fill-extrusion-height': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'height'],
        ],
        'fill-extrusion-base': [
          'interpolate',
          ['linear'],
          ['zoom'],
          15,
          0,
          15.05,
          ['get', 'min_height'],
        ],
        'fill-extrusion-opacity': 0.6,
      },
    })
  }

  const remove3DBuildingsLayer = () => {
    if (!map.value || !map.value.getLayer('3d-buildings')) return
    map.value.removeLayer('3d-buildings')
  }

  const apply3DMode = (enable: boolean, pitch: number = 45) => {
    if (!map.value) return

    if (enable) {
      map.value.flyTo({
        pitch,
        bearing: 0,
        duration: 1500,
        essential: true,
      })

      add3DBuildingsLayer()
    } else {
      map.value.flyTo({
        pitch: 0,
        bearing: 0,
        duration: 1500,
        essential: true,
      })

      remove3DBuildingsLayer()
    }
  }

  const toggle3DMode = () => {
    if (!map.value) return

    is3DMode.value = !is3DMode.value
    apply3DMode(is3DMode.value)
  }

  watch(is3DMode, (is3D) => {
    apply3DMode(is3D, 60)
  })

  return {
    toggle3DMode,
  }
}
