import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { formatDateShort } from '../utils/dates'
import { StoreIcon, PercentIcon, EditIcon } from '../components/ui/Icons'
import './BusinessDetail.css'

export default function PromotionDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    async function fetchPromotion() {
      setLoading(true)
      const { data } = await supabase
        .from('promotions')
        .select('*, businesses(name, slug, logo_url, owner_id, whatsapp)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) setPromotion(data)
      setLoading(false)
    }

    fetchPromotion()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!promotion) return <div className="container business-detail-loading">Promoción no encontrada.</div>

  const business = promotion.businesses
  const isOwner = user?.id === business?.owner_id

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          {business?.logo_url ? <img src={business.logo_url} alt="" /> : <StoreIcon size={30} />}
        </div>
        <div className="business-detail-headinfo">
          <h1>{promotion.title}</h1>
          <p className="business-detail-category">{business?.name}</p>
        </div>
        {isOwner && (
          <Link to={`/promociones/${promotion.slug}/editar`} className="btn btn-outline business-detail-edit">
            <EditIcon size={15} />
            Editar
          </Link>
        )}
      </div>

      {promotion.discount_info && (
        <p className="promotion-detail-discount">
          <PercentIcon size={16} />
          {promotion.discount_info}
        </p>
      )}

      {promotion.description && <p className="business-detail-description">{promotion.description}</p>}

      {promotion.ends_at && (
        <p className="promotion-detail-expiry">Válida hasta el {formatDateShort(promotion.ends_at)}</p>
      )}

      {business && (
        <div className="business-detail-actions">
          <Link to={`/negocio/${business.slug}`} className="btn btn-primary">
            Ver negocio y contactar
          </Link>
        </div>
      )}
    </div>
  )
}
