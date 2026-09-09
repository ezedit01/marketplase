import { Link } from 'react-router-dom'
import { MapPinIcon, ImageIcon } from '../ui/Icons'
import FavoriteButton from './FavoriteButton'
import './ListingCard.css'

function formatPrice(price) {
  if (price == null) return 'Consultar precio'
  return `$${Number(price).toLocaleString('es-AR')}`
}

function formatDate(dateStr) {
  const date = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return 'Hoy'
  if (diffDays === 1) return 'Ayer'
  if (diffDays < 7) return `Hace ${diffDays} días`
  return date.toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function ListingCard({ listing }) {
  const mainImage =
    listing.listing_images?.find((img) => img.is_main)?.url ||
    listing.listing_images?.[0]?.url ||
    null

  return (
    <Link to={`/producto/${listing.slug}`} className="listing-card">
      <div className="listing-card-image">
        <FavoriteButton listingId={listing.id} variant="card" />
        {mainImage ? (
          <img src={mainImage} alt={listing.title} loading="lazy" />
        ) : (
          <div className="listing-card-placeholder">
            <ImageIcon size={28} />
          </div>
        )}
        {listing.featured && <span className="listing-card-featured">Destacado</span>}
        {listing.status === 'sold' && <span className="listing-card-sold">Vendido</span>}
      </div>

      <div className="listing-card-body">
        <p className="listing-card-price">{formatPrice(listing.price)}</p>
        <h3 className="listing-card-title">{listing.title}</h3>
        <div className="listing-card-meta">
          {listing.location && (
            <span>
              <MapPinIcon size={13} />
              {listing.location}
            </span>
          )}
          <span className="listing-card-date">{formatDate(listing.created_at)}</span>
        </div>
      </div>
    </Link>
  )
}
