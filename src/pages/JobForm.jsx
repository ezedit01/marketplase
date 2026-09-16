import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useJobCategories } from '../hooks/useJobCategories'
import { EMPLOYMENT_TYPES } from '../utils/jobs'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

export default function JobForm({ existingJob }) {
  const { user, profile, loading: authLoading } = useAuth()
  const { categories } = useJobCategories()
  const navigate = useNavigate()
  const isEdit = Boolean(existingJob)

  const [title, setTitle] = useState(existingJob?.title || '')
  const [categoryId, setCategoryId] = useState(existingJob?.category_id || '')
  const [employmentType, setEmploymentType] = useState(existingJob?.employment_type || '')
  const [description, setDescription] = useState(existingJob?.description || '')
  const [location, setLocation] = useState(existingJob?.location || '')
  const [salaryInfo, setSalaryInfo] = useState(existingJob?.salary_info || '')
  const [whatsapp, setWhatsapp] = useState(existingJob?.whatsapp || profile?.whatsapp || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/empleos/${existingJob.slug}/editar` : '/empleos/publicar'}`)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !categoryId || !whatsapp.trim()) {
      setError('Completá al menos el título, el rubro y el WhatsApp.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        category_id: Number(categoryId),
        employment_type: employmentType || null,
        description: description.trim(),
        location: location.trim(),
        salary_info: salaryInfo.trim(),
        whatsapp: whatsapp.trim(),
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('jobs').update(payload).eq('id', existingJob.id)
        if (updateError) throw updateError
        navigate(`/empleo/${existingJob.slug}`)
      } else {
        const slug = generateUniqueSlug(title)
        const { error: insertError } = await supabase.from('jobs').insert({
          ...payload,
          slug,
          poster_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/empleo/${slug}`)
      }
    } catch (err) {
      setError('Ocurrió un error al guardar. Intentá de nuevo.')
      console.error(err)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container business-form-page">
      <h1>{isEdit ? 'Editar aviso' : 'Publicar búsqueda laboral'}</h1>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Busco vendedor para local de ropa" required />
        </div>

        <div className="form-field">
          <label>Rubro *</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
            <option value="">Seleccionar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Jornada</label>
          <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
            <option value="">No especificar</option>
            {EMPLOYMENT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Tareas, requisitos, horarios..."
          />
        </div>

        <div className="form-field">
          <label>Zona</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Centro" />
        </div>

        <div className="form-field">
          <label>Sueldo / condiciones</label>
          <input
            value={salaryInfo}
            onChange={(e) => setSalaryInfo(e.target.value)}
            placeholder="Ej: A convenir, o $400.000 + comisión"
          />
        </div>

        <div className="form-field">
          <label>WhatsApp de contacto *</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" required />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar aviso'}
        </button>
      </form>
    </div>
  )
}
