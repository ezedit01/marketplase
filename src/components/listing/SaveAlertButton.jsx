import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { CheckIcon } from '../ui/Icons'

export default function SaveAlertButton({ query, categoryId, minPrice, maxPrice }) {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!user) {
      navigate(`/ingresar?next=${encodeURIComponent(window.location.pathname + window.location.search)}`)
      return
    }

    setSaving(true)
    const { error } = await supabase.from('search_alerts').insert({
      user_id: user.id,
      query: query || null,
      category_id: categoryId,
      min_price: minPrice,
      max_price: maxPrice,
    })
    setSaving(false)

    if (!error) setSaved(true)
  }

  if (saved) {
    return (
      <p className="save-alert-saved">
        <CheckIcon size={15} />
        Guardada. La vas a encontrar en <Link to="/perfil/alertas">tus alertas</Link>.
      </p>
    )
  }

  return (
    <button type="button" className="btn btn-outline save-alert-btn" onClick={handleSave} disabled={saving}>
      {saving ? 'Guardando...' : 'Guardar esta búsqueda'}
    </button>
  )
}
