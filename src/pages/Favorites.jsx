import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useBusinessCategories } from '../hooks/useBusinessCategories'
import { useServiceCategories } from '../hooks/useServiceCategories'
import ListingCard from '../components/listing/ListingCard'
import BusinessCard from '../components/business/BusinessCard'
import ServiceCard from '../components/service/ServiceCard'
import './Favorites.css'

export default function Favorites() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const { categories: businessCategories } = useBusinessCategories()
  const { categories: serviceCategories } = useServiceCategories()
  const [listings, setListings] = useState([])
  const [businesses, setBusinesses] = useState([])
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const businessCategoryMap = Object.fromEntries(businessCategories.map((c) => [c.id, c.name]))
  const serviceCategoryMap = Object.fromEntries(serviceCategories.map((c) => [c.id, c.name]))

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
          listing_id, business_id, service_id,
          listings ( id, title, slug, price, condition, location, created_at, featured, status, listing_images ( url, is_main ) ),
          businesses ( id, name, slug, logo_url, address, category_id, featured, is_premium ),
          services ( id, title, slug, location, category_id, featured, profiles!services_provider_id_fkey(name, avatar_url) )
        `
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (cancelled) return
      // Filtramos si el destino ya no existe (eliminado, y RLS lo esconde)
      setListings((data || []).map((f) => f.listings).filter(Boolean))
      setBusinesses((data || []).map((f) => f.businesses).filter(Boolean))
      setServices((data || []).map((f) => f.services).filter(Boolean))
      setLoading(false)
    }

    fetchFavorites()
    return () => {
      cancelled = true
    }
  }, [user, authLoading, navigate])

  if (authLoading) return null

  const totalFavorites = listings.length + businesses.length + services.length

  return (
    <div className="container favorites-page">
      <div className="favorites-header">
        <Link to="/perfil" className="favorites-back">
          ← Mi perfil
        </Link>
        <h1>Mis favoritos</h1>
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && totalFavorites === 0 && (
        <p className="home-empty">Todavía no guardaste ningún producto, negocio o servicio.</p>
      )}

      {listings.length > 0 && (
        <div className="favorites-group">
          <h2>Productos</h2>
          <div className="listing-grid">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      )}

      {businesses.length > 0 && (
        <div className="favorites-group">
          <h2>Negocios</h2>
          <div className="favorites-row-grid">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} categoryName={businessCategoryMap[b.category_id]} />
            ))}
          </div>
        </div>
      )}

      {services.length > 0 && (
        <div className="favorites-group">
          <h2>Servicios</h2>
          <div className="favorites-row-grid">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} categoryName={serviceCategoryMap[s.category_id]} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
