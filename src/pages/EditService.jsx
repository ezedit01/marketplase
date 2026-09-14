import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import ServiceForm from './ServiceForm'

export default function EditService() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [service, setService] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('services')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setService(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Servicio no encontrado.</div>
  if (service.provider_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar este servicio.</div>
  }

  return <ServiceForm existingService={service} />
}
