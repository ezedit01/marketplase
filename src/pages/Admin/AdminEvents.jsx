import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminEvents() {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchEvents = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('events')
      .select('id, title, slug, status, featured, event_date, profiles!events_organizer_id_fkey(name)')
      .order('event_date', { ascending: false })
      .limit(100)
    setEvents(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  async function toggleFeatured(id, current) {
    await supabase.from('events').update({ featured: !current }).eq('id', id)
    fetchEvents()
  }

  async function deleteEvent(id) {
    if (!confirm('¿Eliminar este evento?')) return
    await supabase.from('events').update({ status: 'deleted' }).eq('id', id)
    fetchEvents()
  }

  return (
    <div>
      <h1>Eventos</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Fecha</th>
              <th>Organizador</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link to={`/evento/${e.slug}`}>{e.title}</Link>{' '}
                  {e.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{e.event_date}</td>
                <td>{e.profiles?.name}</td>
                <td>{e.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(e.id, e.featured)}>
                    {e.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteEvent(e.id)}>
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
