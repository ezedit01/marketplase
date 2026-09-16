export const EMPLOYMENT_TYPES = [
  { value: 'tiempo_completo', label: 'Tiempo completo' },
  { value: 'medio_tiempo', label: 'Medio tiempo' },
  { value: 'temporal', label: 'Temporal' },
  { value: 'por_dia', label: 'Por día' },
]

export function employmentTypeLabel(value) {
  return EMPLOYMENT_TYPES.find((t) => t.value === value)?.label || value
}
