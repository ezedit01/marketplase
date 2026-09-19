import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import ErrandForm from './ErrandForm'

export default function EditErrand() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [errand, setErrand] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('errands')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setErrand(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Publicación no encontrada.</div>
  if (errand.user_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar esta publicación.</div>
  }

  return <ErrandForm existingErrand={errand} />
}
