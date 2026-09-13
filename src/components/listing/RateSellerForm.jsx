import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import RatingStars from './RatingStars'
import './RateSellerForm.css'

export default function RateSellerForm({ sellerId, onSaved }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [existingId, setExistingId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setLoading(false)
      return
    }
    supabase
      .from('seller_ratings')
      .select('id, rating, comment')
      .eq('seller_id', sellerId)
      .eq('rater_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setExistingId(data.id)
          setRating(data.rating)
          setComment(data.comment || '')
        }
        setLoading(false)
      })
  }, [user, sellerId])

  if (!user) {
    return (
      <div className="rate-seller-form rate-seller-login">
        <p>¿Ya tuviste contacto con este vendedor?</p>
        <button className="btn btn-outline" onClick={() => navigate(`/ingresar?next=/vendedor/${sellerId}`)}>
          Ingresá para calificarlo
        </button>
      </div>
    )
  }

  if (user.id === sellerId) return null
  if (loading) return null

  async function handleSubmit(e) {
    e.preventDefault()
    if (rating === 0) return
    setSaving(true)

    const { error } = await supabase.from('seller_ratings').upsert(
      {
        id: existingId || undefined,
        seller_id: sellerId,
        rater_id: user.id,
        rating,
        comment: comment.trim() || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'seller_id,rater_id' }
    )

    setSaving(false)
    if (!error) {
      setSaved(true)
      onSaved?.()
      setTimeout(() => setSaved(false), 2000)
    }
  }

  return (
    <form className="rate-seller-form" onSubmit={handleSubmit}>
      <p className="rate-seller-label">{existingId ? 'Tu calificación' : '¿Cómo fue tu experiencia con este vendedor?'}</p>
      <RatingStars interactive value={rating} onChange={setRating} size={24} />
      <textarea
        placeholder="Comentario (opcional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        rows={2}
      />
      <button type="submit" className="btn btn-primary" disabled={rating === 0 || saving}>
        {saving ? 'Guardando...' : existingId ? 'Actualizar calificación' : 'Calificar'}
      </button>
      {saved && <p className="rate-seller-saved">¡Gracias por tu opinión!</p>}
    </form>
  )
}
