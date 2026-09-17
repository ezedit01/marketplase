import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useEventCategories } from '../hooks/useEventCategories'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

export default function EventForm({ existingEvent }) {
  const { user, profile, loading: authLoading } = useAuth()
  const { categories } = useEventCategories()
  const navigate = useNavigate()
  const isEdit = Boolean(existingEvent)

  const [title, setTitle] = useState(existingEvent?.title || '')
  const [categoryId, setCategoryId] = useState(existingEvent?.category_id || '')
  const [description, setDescription] = useState(existingEvent?.description || '')
  const [location, setLocation] = useState(existingEvent?.location || '')
  const [eventDate, setEventDate] = useState(existingEvent?.event_date || '')
  const [eventTime, setEventTime] = useState(existingEvent?.event_time || '')
  const [whatsapp, setWhatsapp] = useState(existingEvent?.whatsapp || profile?.whatsapp || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/eventos/${existingEvent.slug}/editar` : '/eventos/publicar'}`)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim() || !eventDate) {
      setError('Completá al menos el título y la fecha.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        category_id: categoryId ? Number(categoryId) : null,
        description: description.trim(),
        location: location.trim(),
        event_date: eventDate,
        event_time: eventTime.trim(),
        whatsapp: whatsapp.trim(),
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('events').update(payload).eq('id', existingEvent.id)
        if (updateError) throw updateError
        navigate(`/evento/${existingEvent.slug}`)
      } else {
        const slug = generateUniqueSlug(title)
        const { error: insertError } = await supabase.from('events').insert({
          ...payload,
          slug,
          organizer_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/evento/${slug}`)
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
      <h1>{isEdit ? 'Editar evento' : 'Publicar evento'}</h1>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Feria de artesanos" required />
        </div>

        <div className="form-field">
          <label>Categoría</label>
          <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
            <option value="">Seleccionar</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Fecha *</label>
          <input type="date" value={eventDate} onChange={(e) => setEventDate(e.target.value)} required />
        </div>

        <div className="form-field">
          <label>Horario</label>
          <input value={eventTime} onChange={(e) => setEventTime(e.target.value)} placeholder="Ej: 21:00, o Desde las 18hs" />
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá de qué se trata..."
          />
        </div>

        <div className="form-field">
          <label>Lugar</label>
          <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Plaza San Martín" />
        </div>

        <div className="form-field">
          <label>WhatsApp para consultas (opcional)</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar evento'}
        </button>
      </form>
    </div>
  )
}
