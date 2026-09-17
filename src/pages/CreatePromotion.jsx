import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import PromotionForm from './PromotionForm'

export default function CreatePromotion() {
  const { businessSlug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('businesses')
      .select('id, name, slug, owner_id')
      .eq('slug', businessSlug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setBusiness(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [businessSlug])

  if (!authLoading && !user) {
    navigate(`/ingresar?next=/negocios/${businessSlug}/promociones/nueva`)
    return null
  }

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Negocio no encontrado.</div>
  if (business.owner_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para agregar promociones a este negocio.</div>
  }

  return <PromotionForm business={business} />
}
