import BaseApi from './BaseApi'
import type { Tracker } from '@/types'
import { mockTrackers, mockMovingTrackerRoute } from '@/mock/trackers'

class TrackerApi extends BaseApi {
  getTrackers(): Promise<Tracker[]> {
    return this.get<Tracker[]>(
      '/mock/api/trackers',
      this.withMockAdapter(this.mockAdapter(mockTrackers)),
    )
  }

  getMovingTrackerRoute(): Promise<Array<[number, number, number, string]>> {
    return this.get<Array<[number, number, number, string]>>(
      '/mock/api/movingTrackerRoute',
      this.withMockAdapter(this.mockAdapter(mockMovingTrackerRoute)),
    )
  }
}

export const trackerApi = new TrackerApi()
