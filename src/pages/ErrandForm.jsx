import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useTravelDestinations } from '../hooks/useTravelDestinations'
import { ERRAND_TYPES } from '../utils/errands'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

export default function ErrandForm({ existingErrand }) {
  const { user, profile, loading: authLoading } = useAuth()
  const { destinations } = useTravelDestinations()
  const navigate = useNavigate()
  const isEdit = Boolean(existingErrand)

  const [mode, setMode] = useState(existingErrand?.mode || 'ofrezco')
  const [errandType, setErrandType] = useState(existingErrand?.errand_type || 'encomiendas')
  const [origin, setOrigin] = useState(existingErrand?.origin || 'Sol de Julio')
  const [destinationId, setDestinationId] = useState(existingErrand?.destination_id || '')
  const [errandDate, setErrandDate] = useState(existingErrand?.errand_date || '')
  const [description, setDescription] = useState(existingErrand?.description || '')
  const [budget, setBudget] = useState(existingErrand?.budget || '')
  const [whatsapp, setWhatsapp] = useState(existingErrand?.whatsapp || profile?.whatsapp || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/comisiones/${existingErrand.slug}/editar` : '/comisiones/publicar'}`)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!destinationId || !whatsapp.trim()) {
      setError('Completá al menos el destino y el WhatsApp.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        mode,
        errand_type: errandType,
        origin: origin.trim(),
        destination_id: Number(destinationId),
        errand_date: errandDate || null,
        description: description.trim(),
        budget: budget.trim(),
        whatsapp: whatsapp.trim(),
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('errands').update(payload).eq('id', existingErrand.id)
        if (updateError) throw updateError
        navigate(`/comision/${existingErrand.slug}`)
      } else {
        const slug = generateUniqueSlug(`comision-${errandType}-${origin}`)
        const { error: insertError } = await supabase.from('errands').insert({
          ...payload,
          slug,
          user_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/comision/${slug}`)
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
      <h1>{isEdit ? 'Editar comisión' : 'Publicar comisión o encomienda'}</h1>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>¿Ofrecés o necesitás? *</label>
          <select value={mode} onChange={(e) => setMode(e.target.value)} required>
            <option value="ofrezco">Ofrezco (ya voy a viajar)</option>
            <option value="necesito">Necesito (busco quien lo haga)</option>
          </select>
        </div>

        <div className="form-field">
          <label>Tipo de encargo *</label>
          <select value={errandType} onChange={(e) => setErrandType(e.target.value)} required>
            {ERRAND_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Origen</label>
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Destino *</label>
          <select value={destinationId} onChange={(e) => setDestinationId(e.target.value)} required>
            <option value="">Seleccionar</option>
            {destinations.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-field">
          <label>Fecha (opcional)</label>
          <input type="date" value={errandDate} onChange={(e) => setErrandDate(e.target.value)} />
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Contá qué necesitás o qué podés hacer..."
          />
        </div>

        <div className="form-field">
          <label>Presupuesto / comisión</label>
          <input value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="Ej: $1000, o A convenir" />
        </div>

        <div className="form-field">
          <label>WhatsApp de contacto *</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" required />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar'}
        </button>
      </form>
    </div>
  )
}
