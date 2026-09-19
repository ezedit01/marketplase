import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useTrips } from '../hooks/useTrips'
import { useErrands } from '../hooks/useErrands'
import { useTravelDestinations } from '../hooks/useTravelDestinations'
import { ERRAND_TYPES } from '../utils/errands'
import TripCard from '../components/travel/TripCard'
import ErrandCard from '../components/travel/ErrandCard'
import { PlusIcon, CarIcon, PackageIcon } from '../components/ui/Icons'
import './Businesses.css'
import './Jobs.css'
import './Travel.css'

export default function Travel() {
  const [tab, setTab] = useState('viajes')
  const [destinationId, setDestinationId] = useState(null)
  const [errandType, setErrandType] = useState('')
  const [mode, setMode] = useState('')

  const { destinations } = useTravelDestinations()
  const { trips, loading: tripsLoading } = useTrips({ destinationId })
  const { errands, loading: errandsLoading } = useErrands({
    destinationId,
    errandType: errandType || null,
    mode: mode || null,
  })

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>PUNTO Viajes</h1>
          <p>Viajes compartidos, encomiendas y encargos entre Sol de Julio y otras localidades.</p>
        </div>
        <Link
          to={tab === 'viajes' ? '/viajes/publicar' : '/comisiones/publicar'}
          className="btn btn-primary businesses-add-btn"
        >
          <PlusIcon size={16} />
          {tab === 'viajes' ? 'Publicar viaje' : 'Publicar comisión'}
        </Link>
      </div>

      <div className="travel-tabs">
        <button className={tab === 'viajes' ? 'active' : ''} onClick={() => setTab('viajes')}>
          <CarIcon size={16} />
          Viajes
        </button>
        <button className={tab === 'comisiones' ? 'active' : ''} onClick={() => setTab('comisiones')}>
          <PackageIcon size={16} />
          Comisiones y encomiendas
        </button>
      </div>

      <div className="businesses-category-pills">
        <button className={!destinationId ? 'active' : ''} onClick={() => setDestinationId(null)}>
          Todos los destinos
        </button>
        {destinations.map((d) => (
          <button
            key={d.id}
            className={destinationId === d.id ? 'active' : ''}
            onClick={() => setDestinationId(d.id)}
          >
            {d.name}
          </button>
        ))}
      </div>

      {tab === 'comisiones' && (
        <div className="travel-extra-filters">
          <select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="">Ofrezco y necesito</option>
            <option value="ofrezco">Ofrezco</option>
            <option value="necesito">Necesito</option>
          </select>
          <select value={errandType} onChange={(e) => setErrandType(e.target.value)}>
            <option value="">Cualquier tipo</option>
            {ERRAND_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>
      )}

      {tab === 'viajes' ? (
        <>
          {tripsLoading && <p className="home-empty">Cargando...</p>}
          {!tripsLoading && trips.length === 0 && (
            <p className="home-empty">No hay viajes próximos con esos filtros.</p>
          )}
          <div className="jobs-list">
            {trips.map((t) => (
              <TripCard key={t.id} trip={t} />
            ))}
          </div>
        </>
      ) : (
        <>
          {errandsLoading && <p className="home-empty">Cargando...</p>}
          {!errandsLoading && errands.length === 0 && (
            <p className="home-empty">No hay comisiones con esos filtros.</p>
          )}
          <div className="jobs-list">
            {errands.map((e) => (
              <ErrandCard key={e.id} errand={e} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
