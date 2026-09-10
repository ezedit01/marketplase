import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { TrashIcon, CheckIcon, EditIcon, UserIcon, HeartIcon, ClockIcon, BellIcon } from '../components/ui/Icons'
import './Profile.css'

const TABS = [
  { key: 'active', label: 'Activas' },
  { key: 'sold', label: 'Vendidas' },
  { key: 'deleted', label: 'Eliminadas' },
]

export default function Profile() {
  const { user, profile, loading: authLoading, signOut } = useAuth()
  const navigate = useNavigate()
  const [tab, setTab] = useState('active')
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchMyListings = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('id, title, slug, price, status, created_at, listing_images(url, is_main)')
      .eq('user_id', user.id)
      .eq('status', tab)
      .order('created_at', { ascending: false })
    setListings(data || [])
    setLoading(false)
  }, [user, tab])

  useEffect(() => {
    fetchMyListings()
  }, [fetchMyListings])

  useEffect(() => {
    if (!authLoading && !user) navigate('/ingresar?next=/perfil')
  }, [authLoading, user, navigate])

  async function markAsSold(id) {
    await supabase.from('listings').update({ status: 'sold' }).eq('id', id)
    fetchMyListings()
  }

  async function deleteListing(id) {
    if (!confirm('¿Eliminar esta publicación?')) return
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id)
    fetchMyListings()
  }

  if (authLoading || !profile) return null

  return (
    <div className="container profile-page">
      <div className="profile-header">
        <div className="profile-header-identity">
          <div className="profile-avatar">
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" />
            ) : (
              <UserIcon size={28} className="profile-avatar-placeholder" />
            )}
          </div>
          <div>
            <h1>{profile.name}</h1>
            <p>Miembro desde {new Date(profile.created_at).getFullYear()}</p>
          </div>
        </div>
        <div className="profile-header-actions">
          <Link to="/perfil/editar" className="btn btn-outline">
            <EditIcon size={15} />
            Editar perfil
          </Link>
          <button className="btn btn-outline" onClick={signOut}>
            Cerrar sesión
          </button>
        </div>
      </div>

      <div className="profile-quicklinks">
        <Link to="/perfil/favoritos" className="profile-quicklink">
          <HeartIcon size={19} />
          Favoritos
        </Link>
        <Link to="/perfil/historial" className="profile-quicklink">
          <ClockIcon size={19} />
          Historial
        </Link>
        <Link to="/perfil/alertas" className="profile-quicklink">
          <BellIcon size={19} />
          Alertas
        </Link>
      </div>

      <h2>Mis publicaciones</h2>

      <div className="profile-tabs">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'active' : ''}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && listings.length === 0 && (
        <p className="home-empty">No tenés publicaciones {TABS.find((t) => t.key === tab).label.toLowerCase()}.</p>
      )}

      <div className="profile-listings">
        {listings.map((listing) => {
          const image = listing.listing_images?.find((i) => i.is_main)?.url || listing.listing_images?.[0]?.url
          return (
            <div key={listing.id} className="profile-listing-row">
              <Link to={`/producto/${listing.slug}`} className="profile-listing-image">
                {image && <img src={image} alt="" />}
              </Link>
              <div className="profile-listing-info">
                <Link to={`/producto/${listing.slug}`}>
                  <p className="profile-listing-title">{listing.title}</p>
                </Link>
                <p className="profile-listing-price">
                  {listing.price ? `$${Number(listing.price).toLocaleString('es-AR')}` : 'Consultar'}
                </p>
              </div>
              {tab === 'active' && (
                <div className="profile-listing-actions">
                  <button onClick={() => markAsSold(listing.id)} title="Marcar como vendido">
                    <CheckIcon size={17} />
                  </button>
                  <button onClick={() => deleteListing(listing.id)} title="Eliminar">
                    <TrashIcon size={17} />
                  </button>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
