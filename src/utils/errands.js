export const ERRAND_TYPES = [
  { value: 'encomiendas', label: 'Encomiendas' },
  { value: 'compras', label: 'Compras' },
  { value: 'tramites', label: 'Trámites' },
  { value: 'retiro_paquetes', label: 'Retiro de paquetes' },
  { value: 'traslado_objetos', label: 'Traslado de objetos' },
  { value: 'otro', label: 'Otro' },
]

export function errandTypeLabel(value) {
  return ERRAND_TYPES.find((t) => t.value === value)?.label || value
}
