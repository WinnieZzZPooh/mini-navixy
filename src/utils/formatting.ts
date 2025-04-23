export const formatCoordinates = (coords: { lat: number; lng: number }): string => {
  return `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`
}

export const formatDate = (dateString: string, locale: string = 'ru-RU'): string => {
  const date = new Date(dateString)
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date)
}
