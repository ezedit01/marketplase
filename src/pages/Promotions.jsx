import { usePromotions } from '../hooks/usePromotions'
import PromotionCard from '../components/promotion/PromotionCard'
import './Businesses.css'
import './Jobs.css'

export default function Promotions() {
  const { promotions, loading } = usePromotions({})

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>Promociones</h1>
          <p>Ofertas y descuentos vigentes en negocios del pueblo.</p>
        </div>
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && promotions.length === 0 && (
        <p className="home-empty">No hay promociones activas por ahora.</p>
      )}

      <div className="jobs-list">
        {promotions.map((p) => (
          <PromotionCard key={p.id} promotion={p} />
        ))}
      </div>

      <p className="promotions-hint">
        ¿Tenés un negocio cargado en PUNTO? Entrá a la página de tu negocio para agregar una promoción.
      </p>
    </div>
  )
}
