import { useState, useEffect, useCallback } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { UserIcon, MapPinIcon } from '../components/ui/Icons'
import ListingCard from '../components/listing/ListingCard'
import RatingStars from '../components/listing/RatingStars'
import RateSellerForm from '../components/listing/RateSellerForm'
import './SellerProfile.css'

export default function SellerProfile() {
  const { id } = useParams()
  const [seller, setSeller] = useState(null)
  const [listings, setListings] = useState([])
  const [ratings, setRatings] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  const fetchSeller = useCallback(async () => {
    setLoading(true)
    setNotFound(false)

    const [{ data: profileData }, { data: listingsData }, { data: ratingsData }] = await Promise.all([
      supabase
        .from('profiles')
        .select('id, name, avatar_url, location, created_at, rating_avg, rating_count')
        .eq('id', id)
        .single(),
      supabase
        .from('listings')
        .select('id, title, slug, price, condition, location, created_at, featured, status, listing_images(url, is_main)')
        .eq('user_id', id)
        .eq('status', 'active')
        .order('created_at', { ascending: false }),
      supabase
        .from('seller_ratings')
        .select('id, rating, comment, created_at, profiles!seller_ratings_rater_id_fkey(name, avatar_url)')
        .eq('seller_id', id)
        .order('created_at', { ascending: false })
        .limit(20),
    ])

    if (!profileData) {
      setNotFound(true)
      setLoading(false)
      return
    }

    setSeller(profileData)
    setListings(listingsData || [])
    setRatings(ratingsData || [])
    setLoading(false)
  }, [id])

  useEffect(() => {
    fetchSeller()
  }, [fetchSeller])

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
          {seller.rating_count > 0 ? (
            <RatingStars value={seller.rating_avg} count={seller.rating_count} />
          ) : (
            <p className="seller-profile-no-ratings">Todavía sin calificaciones</p>
          )}
        </div>
      </div>

      <RateSellerForm sellerId={id} onSaved={fetchSeller} />

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

      {ratings.length > 0 && (
        <>
          <h2 className="seller-profile-ratings-title">Opiniones</h2>
          <div className="seller-ratings-list">
            {ratings.map((r) => (
              <div key={r.id} className="seller-rating-row">
                <div className="seller-rating-avatar">
                  {r.profiles?.avatar_url ? (
                    <img src={r.profiles.avatar_url} alt="" />
                  ) : (
                    <UserIcon size={16} />
                  )}
                </div>
                <div className="seller-rating-body">
                  <div className="seller-rating-head">
                    <span className="seller-rating-name">{r.profiles?.name || 'Usuario'}</span>
                    <RatingStars value={r.rating} size={13} />
                  </div>
                  {r.comment && <p className="seller-rating-comment">{r.comment}</p>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
