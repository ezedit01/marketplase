import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { getViewHistorySlugs, clearViewHistory } from '../utils/viewHistory'
import ListingCard from '../components/listing/ListingCard'
import './History.css'

export default function History() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchHistory() {
      setLoading(true)
      const slugs = getViewHistorySlugs()

      if (slugs.length === 0) {
        setListings([])
        setLoading(false)
        return
      }

      const { data } = await supabase
        .from('listings')
        .select(
          'id, title, slug, price, condition, location, created_at, featured, status, listing_images(url, is_main)'
        )
        .in('slug', slugs)

      if (cancelled) return

      // El orden de "in" no respeta el orden de visita, así que lo reordenamos
      // según el historial local (más reciente primero).
      const bySlug = new Map((data || []).map((l) => [l.slug, l]))
      const ordered = slugs.map((s) => bySlug.get(s)).filter(Boolean)

      setListings(ordered)
      setLoading(false)
    }

    fetchHistory()
    return () => {
      cancelled = true
    }
  }, [])

  function handleClear() {
    if (!confirm('¿Borrar todo tu historial de vistos?')) return
    clearViewHistory()
    setListings([])
  }

  return (
    <div className="container history-page">
      <div className="history-header">
        <div>
          <Link to="/perfil" className="history-back">
            ← Mi perfil
          </Link>
          <h1>Vistos recientemente</h1>
        </div>
        {listings.length > 0 && (
          <button className="btn btn-outline" onClick={handleClear}>
            Borrar historial
          </button>
        )}
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && listings.length === 0 && (
        <p className="home-empty">
          Todavía no viste ninguna publicación. Este historial se guarda solo en este dispositivo.
        </p>
      )}

      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
