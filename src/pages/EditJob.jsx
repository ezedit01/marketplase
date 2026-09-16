import { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import JobForm from './JobForm'

export default function EditJob() {
  const { slug } = useParams()
  const { user, loading: authLoading } = useAuth()
  const [job, setJob] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('jobs')
      .select('*')
      .eq('slug', slug)
      .single()
      .then(({ data }) => {
        if (cancelled) return
        if (!data) setNotFound(true)
        else setJob(data)
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading || authLoading) return null
  if (notFound) return <div className="container business-detail-loading">Aviso no encontrado.</div>
  if (job.poster_id !== user?.id) {
    return <div className="container business-detail-loading">No tenés permiso para editar este aviso.</div>
  }

  return <JobForm existingJob={job} />
}
