const STORAGE_KEY = 'punto:view-history'
const MAX_ITEMS = 30

function readHistory() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function writeHistory(items) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    // localStorage lleno o bloqueado (modo incógnito estricto) — no rompemos nada
  }
}

// Registra una visita a una publicación. La más reciente queda primero,
// sin duplicados, con un tope de MAX_ITEMS para no crecer indefinidamente.
export function recordListingView(slug) {
  if (!slug) return
  const history = readHistory().filter((s) => s !== slug)
  history.unshift(slug)
  writeHistory(history.slice(0, MAX_ITEMS))
}

export function getViewHistorySlugs() {
  return readHistory()
}

export function clearViewHistory() {
  writeHistory([])
}
