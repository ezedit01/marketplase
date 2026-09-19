import { Link } from 'react-router-dom'
import { PackageIcon } from '../ui/Icons'
import { errandTypeLabel } from '../../utils/errands'
import './ErrandCard.css'

export default function ErrandCard({ errand }) {
  const destinationName = errand.travel_destinations?.name

  return (
    <Link to={`/comision/${errand.slug}`} className="errand-card">
      <div className={`errand-card-icon ${errand.mode === 'ofrezco' ? 'ofrezco' : 'necesito'}`}>
        <PackageIcon size={20} />
      </div>
      <div className="errand-card-body">
        <div className="errand-card-mode-row">
          <span className={`errand-card-mode ${errand.mode === 'ofrezco' ? 'ofrezco' : 'necesito'}`}>
            {errand.mode === 'ofrezco' ? 'Ofrezco' : 'Necesito'}
          </span>
          <span className="errand-card-type">{errandTypeLabel(errand.errand_type)}</span>
        </div>
        <h3 className="errand-card-title">
          {errand.origin} → {destinationName}
        </h3>
      </div>
      {errand.featured && <span className="errand-card-featured">Destacado</span>}
    </Link>
  )
}
