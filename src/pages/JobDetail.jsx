import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { buildWhatsappJobLink, shareJob } from '../utils/whatsapp'
import { employmentTypeLabel } from '../utils/jobs'
import { WhatsappIcon, ShareIcon, MapPinIcon, BriefcaseIcon, TagIcon, EditIcon, CheckIcon } from '../components/ui/Icons'
import './BusinessDetail.css'

export default function JobDetail() {
  const { slug } = useParams()
  const { user } = useAuth()
  const [job, setJob] = useState(null)
  const [categoryName, setCategoryName] = useState('')
  const [loading, setLoading] = useState(true)
  const [shareStatus, setShareStatus] = useState('')

  useEffect(() => {
    let cancelled = false

    async function fetchJob() {
      setLoading(true)
      const { data } = await supabase
        .from('jobs')
        .select('*, job_categories(name)')
        .eq('slug', slug)
        .single()

      if (cancelled) return
      if (data) {
        setJob(data)
        setCategoryName(data.job_categories?.name || '')
      }
      setLoading(false)
    }

    fetchJob()
    return () => {
      cancelled = true
    }
  }, [slug])

  if (loading) return <div className="container business-detail-loading">Cargando...</div>
  if (!job) return <div className="container business-detail-loading">Aviso no encontrado.</div>

  const isOwner = user?.id === job.poster_id
  const isClosed = job.status === 'closed'
  const whatsappLink = buildWhatsappJobLink(job)

  async function handleShare() {
    const result = await shareJob(job, window.location.href)
    if (result === 'copied') {
      setShareStatus('¡Copiado al portapapeles!')
      setTimeout(() => setShareStatus(''), 2500)
    }
  }

  async function markAsClosed() {
    await supabase.from('jobs').update({ status: 'closed' }).eq('id', job.id)
    setJob({ ...job, status: 'closed' })
  }

  return (
    <div className="container business-detail">
      <div className="business-detail-header">
        <div className="business-detail-logo">
          <BriefcaseIcon size={30} />
        </div>
        <div className="business-detail-headinfo">
          <h1>{job.title}</h1>
          <p className="business-detail-category">
            {categoryName}
            {job.employment_type && ` · ${employmentTypeLabel(job.employment_type)}`}
          </p>
        </div>
        {isOwner && (
          <div className="job-detail-owner-actions">
            <Link to={`/empleos/${job.slug}/editar`} className="btn btn-outline business-detail-edit">
              <EditIcon size={15} />
              Editar
            </Link>
            {!isClosed && (
              <button className="btn btn-outline" onClick={markAsClosed}>
                <CheckIcon size={15} />
                Marcar cubierto
              </button>
            )}
          </div>
        )}
      </div>

      {isClosed && <p className="job-detail-closed-notice">Este puesto ya fue cubierto.</p>}

      {job.description && <p className="business-detail-description">{job.description}</p>}

      <div className="business-detail-info">
        {job.location && (
          <div className="business-detail-info-row">
            <MapPinIcon size={16} />
            <span>{job.location}</span>
          </div>
        )}
        {job.salary_info && (
          <div className="business-detail-info-row">
            <TagIcon size={16} />
            <span>{job.salary_info}</span>
          </div>
        )}
      </div>

      {!isClosed && (
        <div className="business-detail-actions">
          {job.whatsapp && (
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-primary business-detail-whatsapp-btn"
            >
              <WhatsappIcon size={19} />
              Postularme por WhatsApp
            </a>
          )}
          <button className="btn btn-outline" onClick={handleShare}>
            <ShareIcon size={18} />
            Compartir
          </button>
        </div>
      )}

      {shareStatus && <p className="business-detail-share-status">{shareStatus}</p>}
    </div>
  )
}
