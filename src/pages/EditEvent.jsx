import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import EventForm from './EventForm'

export default function EditEvent() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [event, setEvent] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('events')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setEvent(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Evento no encontrado.</div>
  if (event.organizer_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar este evento.</div>
  }

  return <EventForm existingEvent={event} />
}
