export function formatEventDate(dateStr) {
  const date = new Date(`${dateStr}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diffDays = Math.round((date - today) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Mañana'

  return date.toLocaleDateString('es-AR', { weekday: 'short', day: 'numeric', month: 'short' })
}

export function formatDateShort(dateStr) {
  return new Date(`${dateStr}T00:00:00`).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}
