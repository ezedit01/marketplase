import { Link } from 'react-router-dom'
import { StoreIcon, MapPinIcon } from '../ui/Icons'
import './BusinessCard.css'

export default function BusinessCard({ business, categoryName }) {
  return (
    <Link to={`/negocio/${business.slug}`} className="business-card">
      <div className="business-card-logo">
        {business.logo_url ? (
          <img src={business.logo_url} alt={business.name} />
        ) : (
          <StoreIcon size={26} />
        )}
      </div>
      <div className="business-card-body">
        <h3 className="business-card-name">{business.name}</h3>
        {categoryName && <p className="business-card-category">{categoryName}</p>}
        {business.address && (
          <p className="business-card-address">
            <MapPinIcon size={12} />
            {business.address}
          </p>
        )}
      </div>
      {business.featured && <span className="business-card-featured">Destacado</span>}
    </Link>
  )
}
