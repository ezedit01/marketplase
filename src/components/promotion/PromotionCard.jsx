import { Link } from 'react-router-dom'
import { PercentIcon, StoreIcon } from '../ui/Icons'
import { formatDateShort } from '../../utils/dates'
import './PromotionCard.css'

export default function PromotionCard({ promotion }) {
  return (
    <Link to={`/promocion/${promotion.slug}`} className="promotion-card">
      <div className="promotion-card-logo">
        {promotion.businesses?.logo_url ? (
          <img src={promotion.businesses.logo_url} alt="" />
        ) : (
          <StoreIcon size={20} />
        )}
      </div>
      <div className="promotion-card-body">
        <p className="promotion-card-business">{promotion.businesses?.name}</p>
        <h3 className="promotion-card-title">{promotion.title}</h3>
        {promotion.ends_at && (
          <p className="promotion-card-expiry">Hasta el {formatDateShort(promotion.ends_at)}</p>
        )}
      </div>
      {promotion.discount_info && (
        <span className="promotion-card-discount">
          <PercentIcon size={12} />
          {promotion.discount_info}
        </span>
      )}
    </Link>
  )
}
