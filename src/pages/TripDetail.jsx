import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappTripLink, shareTrip } from '../utils/whatsapp'
import { formatEventDate } from '../utils/dates'
import { WhatsappIcon, ShareIcon, CarIcon, CalendarIcon, EditIcon, CheckIcon } from '../components/ui/Icons'
import ReportModal from '../components/listing/ReportModal'
import './BusinessDetail.css'

export default function TripDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchTrip() {
      setLoading(true)
      const { data } = await supabase
        .from('trips')
        .select('*, travel_destinations(name)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) setTrip(data)
      setLoading(false)
    }

    fetchTrip()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!trip) return <div className="container business-detail-loading">Viaje no encontrado.</div>

  const destinationName = trip.travel_destinations?.name
  const isOwner = user?.id === trip.user_id
  const isCompleted = trip.status === 'completed'
  const whatsappLink = trip.whatsapp ? buildWhatsappTripLink(trip, destinationName) : null

  async function handleShare() {
    const result = await shareTrip(trip, destinationName, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  async function markAsCompleted() {
    await supabase.from('trips').update({ status: 'completed' }).eq('id', trip.id)
    setTrip({ ...trip, status: 'completed' })
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          <CarIcon size={30} />
        </div>
        <div className="business-detail-headinfo">
          <h1>
            {trip.origin} → {destinationName}
          </h1>
          <p className="business-detail-category">
            {formatEventDate(trip.trip_date)}
            {trip.departure_time && ` · Salida ${trip.departure_time}`}
          </p>
        </div>
        {isOwner && (
          <div className="job-detail-owner-actions">
            <Link to={`/viajes/${trip.slug}/editar`} className="btn btn-outline business-detail-edit">
              <EditIcon size={15} />
              Editar
            </Link>
            {!isCompleted && (
              <button className="btn btn-outline" onClick={markAsCompleted}>
                <CheckIcon size={15} />
                Marcar finalizado
              </button>
            )}
          </div>
        )}
      </div>

      {isCompleted && <p className="job-detail-closed-notice">Este viaje ya se realizó.</p>}

      {trip.description && <p className="business-detail-description">{trip.description}</p>}

      <div className="business-detail-info">
        <div className="business-detail-info-row">
          <CarIcon size={16} />
          <span>
            {trip.seats_available} lugar{trip.seats_available !== 1 ? 'es' : ''} disponible
            {trip.seats_available !== 1 ? 's' : ''} · {trip.round_trip ? 'Ida y vuelta' : 'Solo ida'}
          </span>
        </div>
        {trip.return_time && (
          <div className="business-detail-info-row">
            <CalendarIcon size={16} />
            <span>Regreso aproximado: {trip.return_time}</span>
          </div>
        )}
        {trip.price && (
          <div className="business-detail-info-row">
            <span>Precio: {trip.price}</span>
          </div>
        )}
      </div>

      {!isCompleted && (
        <div className="business-detail-actions">
          {whatsappLink && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary business-detail-whatsapp-btn"
            >
              <WhatsappIcon size={19} />
              Contactar por WhatsApp
            </a>
          )}
          <button className="btn btn-outline" onClick={handleShare}>
            <ShareIcon size={18} />
            Compartir
          </button>
        </div>
      )}

      {shareStatus && <p className="business-detail-share-status">{shareStatus}</p>}

      <button className="listing-detail-report-link" onClick={() => setReportOpen(true)}>
        Reportar publicación
      </button>

      {reportOpen && (
        <ReportModal targetType="trip" targetId={trip.id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  )
}
