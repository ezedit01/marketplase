import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useServiceCategories } from '../hooks/useServiceCategories'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

export default function ServiceForm({ existingService }) {
  const { user, profile, loading: authLoading } = useAuth()
  const { categories } = useServiceCategories()
  const navigate = useNavigate()
  const isEdit = Boolean(existingService)

  const [title, setTitle] = useState(existingService?.title || '')
  const [categoryId, setCategoryId] = useState(existingService?.category_id || '')
  const [description, setDescription] = useState(existingService?.description || '')
  const [location, setLocation] = useState(existingService?.location || '')
  const [whatsapp, setWhatsapp] = useState(existingService?.whatsapp || profile?.whatsapp || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/servicios/${existingService.slug}/editar` : '/servicios/publicar'}`)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !categoryId || !whatsapp.trim()) {
      setError('Completá al menos el título, la categoría y el WhatsApp.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        category_id: Number(categoryId),
        description: description.trim(),
        location: location.trim(),
        whatsapp: whatsapp.trim(),
      }

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('services')
          .update(payload)
          .eq('id', existingService.id)
        if (updateError) throw updateError
        navigate(`/servicio/${existingService.slug}`)
      } else {
        const slug = generateUniqueSlug(title)
        const { error: insertError } = await supabase.from('services').insert({
          ...payload,
          slug,
          provider_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/servicio/${slug}`)
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
      <h1>{isEdit ? 'Editar servicio' : 'Ofrecer mi servicio'}</h1>
      <p className="service-form-hint">
        Se va a mostrar con tu foto de perfil actual.{' '}
        <Link to="/perfil/editar">¿Querés cambiarla?</Link>
      </p>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Electricista matriculado" required />
        </div>

        <div className="form-field">
          <label>Categoría *</label>
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
          <label>Descripción</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá tu experiencia, qué trabajos hacés..."
          />
        </div>

        <div className="form-field">
          <label>Zona donde trabajás</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Todo el pueblo, o Centro" />
        </div>

        <div className="form-field">
          <label>WhatsApp de contacto *</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" required />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar servicio'}
        </button>
      </form>
    </div>
  )
}
