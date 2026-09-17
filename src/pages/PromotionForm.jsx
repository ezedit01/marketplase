import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

// business: { id, name, slug } — el negocio al que pertenece la promo.
// existingPromotion: si viene, edita en vez de crear.
export default function PromotionForm({ business, existingPromotion }) {
  const navigate = useNavigate()
  const isEdit = Boolean(existingPromotion)

  const [title, setTitle] = useState(existingPromotion?.title || '')
  const [discountInfo, setDiscountInfo] = useState(existingPromotion?.discount_info || '')
  const [description, setDescription] = useState(existingPromotion?.description || '')
  const [endsAt, setEndsAt] = useState(existingPromotion?.ends_at || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!title.trim()) {
      setError('Completá al menos el título de la promo.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        title: title.trim(),
        discount_info: discountInfo.trim(),
        description: description.trim(),
        ends_at: endsAt || null,
      }

      if (isEdit) {
        const { error: updateError } = await supabase
          .from('promotions')
          .update(payload)
          .eq('id', existingPromotion.id)
        if (updateError) throw updateError
        navigate(`/promocion/${existingPromotion.slug}`)
      } else {
        const slug = generateUniqueSlug(title)
        const { error: insertError } = await supabase.from('promotions').insert({
          ...payload,
          slug,
          business_id: business.id,
        })
        if (insertError) throw insertError
        navigate(`/promocion/${slug}`)
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
      <h1>{isEdit ? 'Editar promoción' : 'Nueva promoción'}</h1>
      <p className="service-form-hint">Para {business.name}</p>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>Título *</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: 2x1 en hamburguesas" required />
        </div>

        <div className="form-field">
          <label>Descuento</label>
          <input
            value={discountInfo}
            onChange={(e) => setDiscountInfo(e.target.value)}
            placeholder="Ej: 20% OFF, 2x1"
          />
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Condiciones, productos incluidos..."
          />
        </div>

        <div className="form-field">
          <label>Válida hasta (opcional)</label>
          <input type="date" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar promoción'}
        </button>
      </form>
    </div>
  )
}
