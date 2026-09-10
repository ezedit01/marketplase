import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { UserIcon, MapPinIcon } from '../components/ui/Icons'
import ListingCard from '../components/listing/ListingCard'
import './SellerProfile.css'

export default function SellerProfile() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchSeller() {
      setLoading(true)
      setNotFound(false)

      const [{ data: profileData }, { data: listingsData }] = await Promise.all([
        supabase.from('profiles').select('id, name, avatar_url, location, created_at').eq('id', id).single(),
        supabase
          .from('listings')
          .select('id, title, slug, price, condition, location, created_at, featured, status, listing_images(url, is_main)')
          .eq('user_id', id)
          .eq('status', 'active')
          .order('created_at', { ascending: false }),
      ])

      if (cancelled) return

      if (!profileData) {
        setNotFound(true)
        setLoading(false)
        return
      }

      setSeller(profileData)
      setListings(listingsData || [])
      setLoading(false)
    }

    fetchSeller()
    return () => {
      cancelled = true
    }
  }, [id])

  if (loading) return <div className="container seller-profile-loading">Cargando...</div>
  if (notFound) return <div className="container seller-profile-loading">Perfil no encontrado.</div>

  return (
    <div className="container seller-profile-page">
      <div className="seller-profile-header">
        <div className="seller-profile-avatar">
          {seller.avatar_url ? (
            <img src={seller.avatar_url} alt="" />
          ) : (
            <UserIcon size={34} className="seller-profile-avatar-placeholder" />
          )}
        </div>
        <div>
          <h1>{seller.name}</h1>
          <div className="seller-profile-meta">
            <span>Miembro desde {new Date(seller.created_at).getFullYear()}</span>
            {seller.location && (
              <span>
                <MapPinIcon size={13} /> {seller.location}
              </span>
            )}
          </div>
        </div>
      </div>

      <h2>
        Publicaciones activas <span className="seller-profile-count">({listings.length})</span>
      </h2>

      {listings.length === 0 ? (
        <p className="home-empty">Este vendedor no tiene publicaciones activas por ahora.</p>
      ) : (
        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  )
}
