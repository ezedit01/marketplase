import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import TripForm from './TripForm'

export default function EditTrip() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [trip, setTrip] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('trips')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setTrip(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Viaje no encontrado.</div>
  if (trip.user_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar este viaje.</div>
  }

  return <TripForm existingTrip={trip} />
}
