import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappBusinessLink, shareBusiness } from '../utils/whatsapp'
import { WhatsappIcon, ShareIcon, MapPinIcon, ClockIcon, StoreIcon, EditIcon } from '../components/ui/Icons'
import './BusinessDetail.css'

export default function BusinessDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [business, setBusiness] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchBusiness() {
      setLoading(true)
      const { data } = await supabase
        .from('businesses')
        .select('*, business_categories(name)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) {
        setBusiness(data)
        setCategoryName(data.business_categories?.name || '')
      }
      setLoading(false)
    }

    fetchBusiness()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!business) return <div className="container business-detail-loading">Negocio no encontrado.</div>

  const isOwner = user?.id === business.owner_id
  const whatsappLink = buildWhatsappBusinessLink(business)

  async function handleShare() {
    const result = await shareBusiness(business, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} />
          ) : (
            <StoreIcon size={40} />
          )}
        </div>
        <div className="business-detail-headinfo">
          <h1>{business.name}</h1>
          {categoryName && <p className="business-detail-category">{categoryName}</p>}
        </div>
        {isOwner && (
          <Link to={`/negocios/${business.slug}/editar`} className="btn btn-outline business-detail-edit">
            <EditIcon size={15} />
            Editar
          </Link>
        )}
      </div>

      {business.description && <p className="business-detail-description">{business.description}</p>}

      <div className="business-detail-info">
        {business.address && (
          <div className="business-detail-info-row">
            <MapPinIcon size={16} />
            <span>{business.address}</span>
          </div>
        )}
        {business.hours && (
          <div className="business-detail-info-row">
            <ClockIcon size={16} />
            <span>{business.hours}</span>
          </div>
        )}
      </div>

      <div className="business-detail-actions">
        {business.whatsapp && (
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
