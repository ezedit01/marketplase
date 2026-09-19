import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchTrips = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('trips')
      .select('id, slug, origin, trip_date, status, featured, travel_destinations(name), profiles!trips_user_id_fkey(name)')
      .order('trip_date', { ascending: false })
      .limit(100)
    setTrips(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTrips()
  }, [fetchTrips])

  async function toggleFeatured(id, current) {
    await supabase.from('trips').update({ featured: !current }).eq('id', id)
    fetchTrips()
  }

  async function deleteTrip(id) {
    if (!confirm('¿Eliminar este viaje?')) return
    await supabase.from('trips').update({ status: 'deleted' }).eq('id', id)
    fetchTrips()
  }

  return (
    <div>
      <h1>Viajes</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Fecha</th>
              <th>Publicado por</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {trips.map((t) => (
              <tr key={t.id}>
                <td>
                  <Link to={`/viaje/${t.slug}`}>
                    {t.origin} → {t.travel_destinations?.name}
                  </Link>{' '}
                  {t.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{t.trip_date}</td>
                <td>{t.profiles?.name}</td>
                <td>{t.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(t.id, t.featured)}>
                    {t.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteTrip(t.id)}>
                    <TrashIcon size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
