import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import BusinessForm from './BusinessForm'

export default function EditBusiness() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [business, setBusiness] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
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
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Negocio no encontrado.</div>
  if (business.owner_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar este negocio.</div>
  }

  return <BusinessForm existingBusiness={business} />
}
