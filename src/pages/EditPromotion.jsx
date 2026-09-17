import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import PromotionForm from './PromotionForm'

export default function EditPromotion() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [promotion, setPromotion] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('promotions')
      .select('*, businesses(id, name, slug, owner_id)')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setPromotion(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Promoción no encontrada.</div>
  if (promotion.businesses?.owner_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar esta promoción.</div>
  }

  return <PromotionForm business={promotion.businesses} existingPromotion={promotion} />
}
