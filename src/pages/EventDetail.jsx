import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappEventLink, shareEvent } from '../utils/whatsapp'
import { formatEventDate } from '../utils/dates'
import { WhatsappIcon, ShareIcon, MapPinIcon, CalendarIcon, EditIcon } from '../components/ui/Icons'
import './BusinessDetail.css'

export default function EventDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [event, setEvent] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchEvent() {
      setLoading(true)
      const { data } = await supabase
        .from('events')
        .select('*, event_categories(name)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) {
        setEvent(data)
        setCategoryName(data.event_categories?.name || '')
      }
      setLoading(false)
    }

    fetchEvent()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!event) return <div className="container business-detail-loading">Evento no encontrado.</div>

  const isOwner = user?.id === event.organizer_id
  const isCancelled = event.status === 'cancelled'
  const whatsappLink = event.whatsapp ? buildWhatsappEventLink(event) : null

  async function handleShare() {
    const result = await shareEvent(event, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  async function markAsCancelled() {
    if (!confirm('¿Marcar este evento como cancelado?')) return
    await supabase.from('events').update({ status: 'cancelled' }).eq('id', event.id)
    setEvent({ ...event, status: 'cancelled' })
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          <CalendarIcon size={30} />
        </div>
        <div className="business-detail-headinfo">
          <h1>{event.title}</h1>
          <p className="business-detail-category">
            {formatEventDate(event.event_date)}
            {event.event_time && ` · ${event.event_time}`}
            {categoryName && ` · ${categoryName}`}
          </p>
        </div>
        {isOwner && (
          <div className="job-detail-owner-actions">
            <Link to={`/eventos/${event.slug}/editar`} className="btn btn-outline business-detail-edit">
              <EditIcon size={15} />
              Editar
            </Link>
            {!isCancelled && (
              <button className="btn btn-outline" onClick={markAsCancelled}>
                Cancelar evento
              </button>
            )}
          </div>
        )}
      </div>

      {isCancelled && <p className="job-detail-closed-notice">Este evento fue cancelado.</p>}

      {event.description && <p className="business-detail-description">{event.description}</p>}

      {event.location && (
        <div className="business-detail-info">
          <div className="business-detail-info-row">
            <MapPinIcon size={16} />
            <span>{event.location}</span>
          </div>
        </div>
      )}

      <div className="business-detail-actions">
        {whatsappLink && (
          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary business-detail-whatsapp-btn"
          >
            <WhatsappIcon size={19} />
            Consultar por WhatsApp
          </a>
        )}
        <button className="btn btn-outline" onClick={handleShare}>
          <ShareIcon size={18} />
          Compartir
        </button>
      </div>

      {shareStatus && <p className="business-detail-share-status">{shareStatus}</p>}
    </div>
  )
}
