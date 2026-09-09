import { useState } from 'react'
import { supabase } from '../../lib/supabaseClient'
import { useAuth } from '../../hooks/useAuth'
import { CloseIcon, CheckIcon } from '../ui/Icons'
import './ReportModal.css'

const REASONS = [
  { value: 'estafa', label: 'Estafa' },
  { value: 'prohibido', label: 'Producto prohibido' },
  { value: 'inapropiado', label: 'Contenido inapropiado' },
  { value: 'falsa', label: 'Publicación falsa' },
  { value: 'otro', label: 'Otro' },
]

export default function ReportModal({ listingId, onClose }) {
  const { user } = useAuth()
  const [reason, setReason] = useState('estafa')
  const [details, setDetails] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    if (!user) {
      setError('Necesitás iniciar sesión para reportar una publicación.')
      return
    }
    const { error: insertError } = await supabase.from('reports').insert({
      listing_id: listingId,
      reporter_id: user.id,
      reason,
      details,
    })
    if (insertError) {
      setError('No pudimos enviar el reporte. Intentá de nuevo.')
      return
    }
    setSubmitted(true)
  }

  return (
    <div className="report-modal-overlay" onClick={onClose}>
      <div className="report-modal" onClick={(e) => e.stopPropagation()}>
        <button className="report-modal-close" onClick={onClose} aria-label="Cerrar">
          <CloseIcon size={18} />
        </button>

        {submitted ? (
          <div className="report-modal-success">
            <CheckIcon size={32} />
            <p>Gracias, recibimos tu reporte.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h3>Reportar publicación</h3>

            <div className="report-modal-reasons">
              {REASONS.map((r) => (
                <label key={r.value}>
                  <input
                    type="radio"
                    name="reason"
                    value={r.value}
                    checked={reason === r.value}
                    onChange={() => setReason(r.value)}
                  />
                  {r.label}
                </label>
              ))}
            </div>

            <textarea
              placeholder="Contanos más (opcional)"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              rows={3}
            />

            {error && <p className="report-modal-error">{error}</p>}

            <button type="submit" className="btn btn-primary">
              Enviar reporte
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
