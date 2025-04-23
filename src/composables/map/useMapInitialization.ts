import { ref, onMounted, onUnmounted } from 'vue'
import { useI18n } from 'vue-i18n'
import mapboxgl from 'mapbox-gl'
import MapboxDraw from '@mapbox/mapbox-gl-draw'
import MapboxGeocoder from '@mapbox/mapbox-gl-geocoder'
import 'mapbox-gl/dist/mapbox-gl.css'
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css'
import '@mapbox/mapbox-gl-geocoder/dist/mapbox-gl-geocoder.css'

export function useMapInitialization(containerRef: any) {
  const { t } = useI18n()

  const MAPBOX_API_KEY = import.meta.env.VITE_MAPBOX_API_KEY || ''

  const map = ref<mapboxgl.Map | null>(null)
  const draw = ref<any | null>(null)
  const geocoder = ref<any | null>(null)

  onMounted(() => {
    if (!containerRef.value) return

    mapboxgl.accessToken = MAPBOX_API_KEY

    map.value = new mapboxgl.Map({
      container: containerRef.value,
      style: 'mapbox://styles/mapbox/streets-v11',
      center: [37.6173, 55.7558], // Москва
      zoom: 4,
    })

    draw.value = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: true,
        trash: true,
      },
    })

    geocoder.value = new MapboxGeocoder({
      accessToken: mapboxgl.accessToken,
      mapboxgl: mapboxgl,
      marker: false,
      placeholder: t('geozone.enterAddress'),
    })
  })

  onUnmounted(() => {
    try {
      if (map.value) {
        if (draw.value) {
          try {
            map.value.removeControl(draw.value)
          } catch (error) {
            console.error('Error removing draw control:', error)
          }
        }

        if (geocoder.value) {
          try {
            map.value.removeControl(geocoder.value)
          } catch (error) {
            console.error('Error removing geocoder control:', error)
          }
        }

        map.value.remove()
      }
    } catch (error) {
      console.error('Error during map cleanup:', error)
    }
  })

  return {
    map,
    draw,
    geocoder,
  }
}
