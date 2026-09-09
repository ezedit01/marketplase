export function slugify(text) {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // saca acentos
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

// Genera un slug único agregando un sufijo corto random
export function generateUniqueSlug(title) {
  const base = slugify(title)
  const suffix = Math.random().toString(36).substring(2, 7)
  return `${base}-${suffix}`
}
