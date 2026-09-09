import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import ListingCard from '../components/listing/ListingCard'
import './Favorites.css'

export default function Favorites() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ingresar?next=/perfil/favoritos')
      return
    }
    if (!user) return

    let cancelled = false

    async function fetchFavorites() {
      setLoading(true)
      const { data } = await supabase
        .from('favorites')
        .select(
          `
          listing_id,
          listings (
            id, title, slug, price, condition, location, created_at, featured, status,
            listing_images ( url, is_main )
          )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cancelled) return
      // Filtramos publicaciones eliminadas (el join puede traer null si status='deleted' y RLS lo esconde)
      setListings((data || []).map((f) => f.listings).filter(Boolean))
      setLoading(false)
    }

    fetchFavorites()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, navigate])

  if (authLoading) return null

  return (
    <div className="container favorites-page">
      <div className="favorites-header">
        <Link to="/perfil" className="favorites-back">
          ← Mi perfil
        </Link>
        <h1>Mis favoritos</h1>
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && listings.length === 0 && (
        <p className="home-empty">Todavía no guardaste ninguna publicación.</p>
      )}

      <div className="listing-grid">
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    </div>
  )
}
