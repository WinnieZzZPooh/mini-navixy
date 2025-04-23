import { ref, watch } from 'vue'
import mapboxgl from 'mapbox-gl'
import type { Ref } from 'vue'
import type { LngLatLike } from 'mapbox-gl'
import type { GeoZone } from '@/types'

export function useGeoZones(
  map: Ref<any>,
  geoZones: Ref<GeoZone[]>,
  onGeoZoneClick: (geoZoneId: string) => void,
) {
  const geoZonePolygons = ref<{ [key: string]: mapboxgl.GeoJSONSource }>({})

  const addGeoZonesToMap = () => {
    if (!map.value) return

    const existingSourceIds: string[] = []
    if (map.value.getStyle() && map.value.getStyle().sources) {
      Object.keys(map.value.getStyle().sources).forEach((sourceId) => {
        if (sourceId.startsWith('geozone-')) {
          existingSourceIds.push(sourceId)
        }
      })
    }

    ;[...existingSourceIds, ...Object.keys(geoZonePolygons.value)].forEach((id) => {
      const gzId = id.startsWith('geozone-') ? id.substring(8) : id

      if (map.value?.getLayer(`geozone-fill-${gzId}`)) {
        map.value.removeLayer(`geozone-fill-${gzId}`)
      }
      if (map.value?.getLayer(`geozone-outline-${gzId}`)) {
        map.value.removeLayer(`geozone-outline-${gzId}`)
      }
      if (map.value?.getSource(`geozone-${gzId}`)) {
        map.value.removeSource(`geozone-${gzId}`)
      }
    })

    geoZonePolygons.value = {}

    geoZones.value.forEach((geoZone) => {
      if (!geoZone.visible) return

      const coordinates = geoZone.coordinates.map((coord) => [coord[0], coord[1]])

      const sourceId = `geozone-${geoZone.id}`
      if (map.value?.getSource(sourceId)) {
        map.value.removeSource(sourceId)
      }

      map.value?.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {
            id: geoZone.id,
            name: geoZone.name,
          },
          geometry: {
            type: 'Polygon',
            coordinates: [coordinates],
          },
        },
      })

      map.value?.addLayer({
        id: `geozone-fill-${geoZone.id}`,
        type: 'fill',
        source: `geozone-${geoZone.id}`,
        layout: {},
        paint: {
          'fill-color': geoZone.color || 'rgba(33, 150, 243, 0.25)',
          'fill-opacity': 0.6,
        },
      })

      map.value?.addLayer({
        id: `geozone-outline-${geoZone.id}`,
        type: 'line',
        source: `geozone-${geoZone.id}`,
        layout: {},
        paint: {
          'line-color': geoZone.borderColor || 'rgba(33, 150, 243, 0.8)',
          'line-width': 2,
        },
      })

      geoZonePolygons.value[geoZone.id] = map.value?.getSource(
        `geozone-${geoZone.id}`,
      ) as mapboxgl.GeoJSONSource

      map.value?.on('click', `geozone-fill-${geoZone.id}`, (e: any) => {
        if (e.features && e.features.length > 0) {
          const geoZoneId = e.features[0].properties?.id
          if (geoZoneId) {
            onGeoZoneClick(geoZoneId)
          }
        }
      })

      map.value?.on('mouseenter', `geozone-fill-${geoZone.id}`, () => {
        if (map.value) map.value.getCanvas().style.cursor = 'pointer'
      })

      map.value?.on('mouseleave', `geozone-fill-${geoZone.id}`, () => {
        if (map.value) map.value.getCanvas().style.cursor = ''
      })
    })
  }

  const centerOnGeoZone = (geoZoneId: string) => {
    if (!map.value) return

    const geoZone = geoZones.value.find((gz) => gz.id === geoZoneId)
    if (!geoZone) return

    const coordinates = geoZone.coordinates
    const bounds = coordinates.reduce(
      (bounds, coord) => {
        return bounds.extend([coord[0], coord[1]] as LngLatLike)
      },
      new mapboxgl.LngLatBounds(coordinates[0], coordinates[0]),
    )

    map.value.fitBounds(bounds, {
      padding: 50,
      duration: 1000,
    })
  }

  const cleanupGeoZones = () => {
    if (!map.value) return

    Object.keys(geoZonePolygons.value).forEach((id) => {
      if (map.value?.getLayer(`geozone-fill-${id}`)) {
        map.value.removeLayer(`geozone-fill-${id}`)
      }
      if (map.value?.getLayer(`geozone-outline-${id}`)) {
        map.value.removeLayer(`geozone-outline-${id}`)
      }
      if (map.value?.getSource(`geozone-${id}`)) {
        map.value.removeSource(`geozone-${id}`)
      }
    })

    geoZonePolygons.value = {}
  }

  watch(
    geoZones,
    () => {
      addGeoZonesToMap()
    },
    { deep: true },
  )

  return {
    geoZonePolygons,
    addGeoZonesToMap,
    centerOnGeoZone,
    cleanupGeoZones,
  }
}
