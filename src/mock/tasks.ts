import type { Task } from '../types'

export const mockTasks: Task[] = [
  {
    id: '1',
    name: 'Работа в Navixy',
    description: 'Контракт в Сербии для frontend разработчика, минимум на год',
    comment: 'Пичугин Максим',
    geoZoneId: '3',
    trackerId: '1',
    address: 'Knez Mihailova 12, 11000 Belgrade, Serbia',
    coordinates: {
      lat: 44.816245,
      lng: 20.460469,
    },
    deadline: '2026-05-15T18:00:00',
    required: true,
    createdAt: '2023-05-10T10:00:00',
  },
  {
    id: '2',
    name: 'Доставить груз',
    description: 'Доставить груз по указанному адресу в центре Москвы',
    comment: 'Срочно',
    geoZoneId: '1',
    trackerId: '2',
    address: 'Москва, Тверская улица, 7',
    coordinates: {
      lat: 55.7558,
      lng: 37.6173,
    },
    deadline: '2025-05-03T18:00:00',
    required: true,
    createdAt: '2023-05-10T10:00:00',
  },
  {
    id: '3',
    name: 'Забрать посылку',
    description: 'Забрать посылку из пункта выдачи',
    comment: 'Код: 1234',
    geoZoneId: '2',
    trackerId: '3',
    address: 'Москва, Химки, Аэропорт Шереметьево',
    coordinates: {
      lat: 55.9736,
      lng: 37.4125,
    },
    deadline: '2023-05-20T12:00:00',
    required: false,
    createdAt: '2023-05-10T11:00:00',
  },
]
