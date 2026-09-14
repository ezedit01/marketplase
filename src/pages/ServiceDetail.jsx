import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappServiceLink, shareService } from '../utils/whatsapp'
import { WhatsappIcon, ShareIcon, MapPinIcon, WrenchIcon, EditIcon } from '../components/ui/Icons'
import './BusinessDetail.css'

export default function ServiceDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [service, setService] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchService() {
      setLoading(true)
      const { data } = await supabase
        .from('services')
        .select('*, service_categories(name), profiles!services_provider_id_fkey(name, avatar_url)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) {
        setService(data)
        setCategoryName(data.service_categories?.name || '')
      }
      setLoading(false)
    }

    fetchService()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!service) return <div className="container business-detail-loading">Servicio no encontrado.</div>

  const isOwner = user?.id === service.provider_id
  const whatsappLink = buildWhatsappServiceLink(service)

  async function handleShare() {
    const result = await shareService(service, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          {service.profiles?.avatar_url ? (
            <img src={service.profiles.avatar_url} alt="" />
          ) : (
            <WrenchIcon size={34} />
          )}
        </div>
        <div className="business-detail-headinfo">
          <h1>{service.title}</h1>
          <p className="business-detail-category">
            {service.profiles?.name}
            {categoryName && ` · ${categoryName}`}
          </p>
        </div>
        {isOwner && (
          <Link to={`/servicios/${service.slug}/editar`} className="btn btn-outline business-detail-edit">
            <EditIcon size={15} />
            Editar
          </Link>
        )}
      </div>

      {service.description && <p className="business-detail-description">{service.description}</p>}

      {service.location && (
        <div className="business-detail-info">
          <div className="business-detail-info-row">
            <MapPinIcon size={16} />
            <span>{service.location}</span>
          </div>
        </div>
      )}

      <div className="business-detail-actions">
        {service.whatsapp && (
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

      {shareStatus && <p className="business-detail-share-status">{shareStatus}</p>}
    </div>
  )
}
