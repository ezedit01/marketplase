import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappErrandLink, shareErrand } from '../utils/whatsapp'
import { errandTypeLabel } from '../utils/errands'
import { formatDateShort } from '../utils/dates'
import { WhatsappIcon, ShareIcon, PackageIcon, CalendarIcon, EditIcon, CheckIcon } from '../components/ui/Icons'
import ReportModal from '../components/listing/ReportModal'
import './BusinessDetail.css'

export default function ErrandDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [errand, setErrand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')
  const [reportOpen, setReportOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function fetchErrand() {
      setLoading(true)
      const { data } = await supabase
        .from('errands')
        .select('*, travel_destinations(name)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) setErrand(data)
      setLoading(false)
    }

    fetchErrand()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!errand) return <div className="container business-detail-loading">Publicación no encontrada.</div>

  const destinationName = errand.travel_destinations?.name
  const title = `${errandTypeLabel(errand.errand_type)}: ${errand.origin} → ${destinationName}`
  const isOwner = user?.id === errand.user_id
  const isCompleted = errand.status === 'completed'
  const whatsappLink = errand.whatsapp ? buildWhatsappErrandLink(errand, title) : null

  async function handleShare() {
    const result = await shareErrand(errand, title, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  async function markAsCompleted() {
    await supabase.from('errands').update({ status: 'completed' }).eq('id', errand.id)
    setErrand({ ...errand, status: 'completed' })
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          <PackageIcon size={30} />
        </div>
        <div className="business-detail-headinfo">
          <h1>{title}</h1>
          <p className="business-detail-category">
            {errand.mode === 'ofrezco' ? 'Ofrezco' : 'Necesito'}
            {errand.errand_date && ` · ${formatDateShort(errand.errand_date)}`}
          </p>
        </div>
        {isOwner && (
          <div className="job-detail-owner-actions">
            <Link to={`/comisiones/${errand.slug}/editar`} className="btn btn-outline business-detail-edit">
              <EditIcon size={15} />
              Editar
            </Link>
            {!isCompleted && (
              <button className="btn btn-outline" onClick={markAsCompleted}>
                <CheckIcon size={15} />
                Marcar finalizada
              </button>
            )}
          </div>
        )}
      </div>

      {isCompleted && <p className="job-detail-closed-notice">Esta comisión ya fue resuelta.</p>}

      {errand.description && <p className="business-detail-description">{errand.description}</p>}

      <div className="business-detail-info">
        {errand.errand_date && (
          <div className="business-detail-info-row">
            <CalendarIcon size={16} />
            <span>{formatDateShort(errand.errand_date)}</span>
          </div>
        )}
        {errand.budget && (
          <div className="business-detail-info-row">
            <span>Presupuesto: {errand.budget}</span>
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
        <ReportModal targetType="errand" targetId={errand.id} onClose={() => setReportOpen(false)} />
      )}
    </div>
  )
}
