import BaseApi from './BaseApi'
import type { GeoZone } from '@/types'
import { mockGeoZones } from '@/mock/geozones'

class GeoZoneApi extends BaseApi {
  getGeoZones(): Promise<GeoZone[]> {
    return this.get<GeoZone[]>(
      '/mock/api/geozones',
      this.withMockAdapter(this.mockAdapter(mockGeoZones)),
    )
  }

  saveGeoZone(geoZone: GeoZone): Promise<GeoZone> {
    return this.post<GeoZone, GeoZone>(
      '/mock/api/geozones',
      geoZone,
      this.withMockAdapter(this.mockAdapter(geoZone)),
    )
  }
}

export const geoZoneApi = new GeoZoneApi()
