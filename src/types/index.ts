export interface Tracker {
  id: string
  name: string
  coordinates: {
    lat: number
    lng: number
  }
  status: 'online' | 'offline'
  state: 'moving' | 'stopped'
  lastUpdate: string
  speed?: number
  icon?: string
  color?: string
  photo?: string
}

export interface GeoZone {
  id: string
  name: string
  coordinates: Array<[number, number]> // [lng, lat]
  visible: boolean
  color: string
  borderColor?: string
  createdAt: string
}

export interface Task {
  id: string
  name: string
  description: string
  comment?: string
  geoZoneId: string
  trackerId: string
  address: string
  coordinates: {
    lat: number
    lng: number
  }
  deadline: string
  required: boolean
  createdAt: string
}
