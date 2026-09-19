import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useTravelDestinations } from '../hooks/useTravelDestinations'
import { generateUniqueSlug } from '../utils/slug'
import './BusinessForm.css'

export default function TripForm({ existingTrip }) {
  const { user, profile, loading: authLoading } = useAuth()
  const { destinations } = useTravelDestinations()
  const navigate = useNavigate()
  const isEdit = Boolean(existingTrip)

  const [origin, setOrigin] = useState(existingTrip?.origin || 'Sol de Julio')
  const [destinationId, setDestinationId] = useState(existingTrip?.destination_id || '')
  const [tripDate, setTripDate] = useState(existingTrip?.trip_date || '')
  const [departureTime, setDepartureTime] = useState(existingTrip?.departure_time || '')
  const [returnTime, setReturnTime] = useState(existingTrip?.return_time || '')
  const [roundTrip, setRoundTrip] = useState(existingTrip?.round_trip || false)
  const [seatsAvailable, setSeatsAvailable] = useState(existingTrip?.seats_available || 1)
  const [price, setPrice] = useState(existingTrip?.price || '')
  const [description, setDescription] = useState(existingTrip?.description || '')
  const [whatsapp, setWhatsapp] = useState(existingTrip?.whatsapp || profile?.whatsapp || '')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  if (!authLoading && !user) {
    navigate(`/ingresar?next=${isEdit ? `/viajes/${existingTrip.slug}/editar` : '/viajes/publicar'}`)
    return null
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')

    if (!origin.trim() || !destinationId || !tripDate || !whatsapp.trim()) {
      setError('Completá al menos origen, destino, fecha y WhatsApp.')
      return
    }

    setSubmitting(true)

    try {
      const payload = {
        origin: origin.trim(),
        destination_id: Number(destinationId),
        trip_date: tripDate,
        departure_time: departureTime.trim(),
        return_time: returnTime.trim(),
        round_trip: roundTrip,
        seats_available: Number(seatsAvailable) || 1,
        price: price.trim(),
        description: description.trim(),
        whatsapp: whatsapp.trim(),
      }

      if (isEdit) {
        const { error: updateError } = await supabase.from('trips').update(payload).eq('id', existingTrip.id)
        if (updateError) throw updateError
        navigate(`/viaje/${existingTrip.slug}`)
      } else {
        const slug = generateUniqueSlug(`viaje-${origin}-${destinations.find((d) => d.id === Number(destinationId))?.slug || ''}`)
        const { error: insertError } = await supabase.from('trips').insert({
          ...payload,
          slug,
          user_id: user.id,
        })
        if (insertError) throw insertError
        navigate(`/viaje/${slug}`)
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
      <h1>{isEdit ? 'Editar viaje' : 'Publicar un viaje'}</h1>

      <form onSubmit={handleSubmit} className="business-form">
        <div className="form-field">
          <label>Origen *</label>
          <input value={origin} onChange={(e) => setOrigin(e.target.value)} required />
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
          <label>Fecha *</label>
          <input type="date" value={tripDate} onChange={(e) => setTripDate(e.target.value)} required />
        </div>

        <div className="form-field">
          <label>Hora de salida</label>
          <input value={departureTime} onChange={(e) => setDepartureTime(e.target.value)} placeholder="Ej: 07:30" />
        </div>

        <div className="form-field">
          <label>
            <input
              type="checkbox"
              checked={roundTrip}
              onChange={(e) => setRoundTrip(e.target.checked)}
              style={{ width: 'auto', marginRight: 8 }}
            />
            Ida y vuelta
          </label>
        </div>

        {roundTrip && (
          <div className="form-field">
            <label>Hora aproximada de regreso</label>
            <input value={returnTime} onChange={(e) => setReturnTime(e.target.value)} placeholder="Ej: 18:00" />
          </div>
        )}

        <div className="form-field">
          <label>Lugares disponibles</label>
          <input
            type="number"
            min="1"
            value={seatsAvailable}
            onChange={(e) => setSeatsAvailable(e.target.value)}
          />
        </div>

        <div className="form-field">
          <label>Precio</label>
          <input value={price} onChange={(e) => setPrice(e.target.value)} placeholder="Ej: $3000, o Consultar" />
        </div>

        <div className="form-field">
          <label>Descripción</label>
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Detalles del viaje..."
          />
        </div>

        <div className="form-field">
          <label>WhatsApp de contacto *</label>
          <input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="Ej: 3854123456" required />
        </div>

        {error && <p className="business-form-error">{error}</p>}

        <button type="submit" className="btn btn-primary" disabled={submitting}>
          {submitting ? 'Guardando...' : isEdit ? 'Guardar cambios' : 'Publicar viaje'}
        </button>
      </form>
    </div>
  )
}
