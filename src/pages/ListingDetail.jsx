import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { buildWhatsappContactLink, shareListing } from '../utils/whatsapp'
import { WhatsappIcon, ShareIcon, MapPinIcon, TagIcon, ImageIcon, UserIcon } from '../components/ui/Icons'
import ReportModal from '../components/listing/ReportModal'
import FavoriteButton from '../components/listing/FavoriteButton'
import './ListingDetail.css'

export default function ListingDetail() {
  const { slug } = useParams()
  const [listing, setListing] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
  const [reportOpen, setReportOpen] = useState(false)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchListing() {
      setLoading(true)
      const { data } = await supabase
        .from('listings')
        .select(
          `
          *,
          listing_images ( id, url, is_main, order_index ),
          profiles!listings_user_id_fkey ( id, name, avatar_url, whatsapp, location, created_at )
        `
        )
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) {
        setListing(data)
        supabase.rpc('increment_listing_views', { listing_id_input: data.id })
      }
      setLoading(false)
    }

    fetchListing()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container listing-detail-loading">Cargando...</div>
  if (!listing) return <div className="container listing-detail-loading">Publicación no encontrada.</div>

  const images = [...(listing.listing_images || [])].sort((a, b) => a.order_index - b.order_index)
  const seller = listing.profiles
  const priceText = listing.price ? `$${Number(listing.price).toLocaleString('es-AR')}` : 'Consultar precio'
  const whatsappLink = buildWhatsappContactLink({ ...listing, seller_whatsapp: seller?.whatsapp })

  async function handleShare() {
    const result = await shareListing(listing, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  return (
    <div className="container listing-detail">
      <div className="listing-detail-gallery">
        <div className="listing-detail-main-image">
          {images.length > 0 ? (
            <img src={images[activeImage].url} alt={listing.title} />
          ) : (
            <div className="listing-detail-placeholder">
              <ImageIcon size={48} />
            </div>
          )}
        </div>
        {images.length > 1 && (
          <div className="listing-detail-thumbs">
            {images.map((img, i) => (
              <button
                key={img.id}
                className={i === activeImage ? 'active' : ''}
                onClick={() => setActiveImage(i)}
              >
                <img src={img.url} alt="" />
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="listing-detail-info">
        {listing.status === 'sold' && <span className="listing-detail-sold-tag">Vendido</span>}

        <p className="listing-detail-price">{priceText}</p>
        <h1>{listing.title}</h1>

        <div className="listing-detail-meta">
          {listing.location && (
            <span>
              <MapPinIcon size={14} /> {listing.location}
            </span>
          )}
          {listing.condition && (
            <span>
              <TagIcon size={14} /> {listing.condition === 'new' ? 'Nuevo' : 'Usado'}
            </span>
          )}
        </div>

        <p className="listing-detail-description">{listing.description}</p>

        <div className="listing-detail-actions">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary listing-detail-whatsapp-btn"
          >
            <WhatsappIcon size={19} />
            Contactar por WhatsApp
          </a>
          <button className="btn btn-outline" onClick={handleShare}>
            <ShareIcon size={18} />
            Compartir
          </button>
          <FavoriteButton listingId={listing.id} variant="detail" />
        </div>

        {shareStatus && <p className="listing-detail-share-status">{shareStatus}</p>}

        {seller && (
          <Link to={`/vendedor/${listing.user_id}`} className="listing-detail-seller">
            <div className="listing-detail-seller-avatar">
              {seller.avatar_url ? (
                <img src={seller.avatar_url} alt="" />
              ) : (
                <UserIcon size={18} className="listing-detail-seller-avatar-placeholder" />
              )}
            </div>
            <div>
              <p className="listing-detail-seller-label">Vendedor</p>
              <p className="listing-detail-seller-name">{seller.name}</p>
            </div>
          </Link>
        )}

        <button className="listing-detail-report-link" onClick={() => setReportOpen(true)}>
          Reportar publicación
        </button>
      </div>

      {reportOpen && <ReportModal listingId={listing.id} onClose={() => setReportOpen(false)} />}
    </div>
  )
}
