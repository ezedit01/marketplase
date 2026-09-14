import { Link } from 'react-router-dom'
import { WrenchIcon, MapPinIcon } from '../ui/Icons'
import './ServiceCard.css'

export default function ServiceCard({ service, categoryName }) {
  return (
    <Link to={`/servicio/${service.slug}`} className="service-card">
      <div className="service-card-avatar">
        {service.profiles?.avatar_url ? (
          <img src={service.profiles.avatar_url} alt="" />
        ) : (
          <WrenchIcon size={22} />
        )}
      </div>
      <div className="service-card-body">
        <h3 className="service-card-title">{service.title}</h3>
        <p className="service-card-provider">{service.profiles?.name}</p>
        {categoryName && <p className="service-card-category">{categoryName}</p>}
        {service.location && (
          <p className="service-card-location">
            <MapPinIcon size={12} />
            {service.location}
          </p>
        )}
      </div>
      {service.featured && <span className="service-card-featured">Destacado</span>}
    </Link>
  )
}
