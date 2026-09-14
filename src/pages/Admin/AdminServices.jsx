import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminServices() {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchServices = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('services')
      .select('id, title, slug, status, featured, created_at, profiles!services_provider_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setServices(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchServices()
  }, [fetchServices])

  async function toggleFeatured(id, current) {
    await supabase.from('services').update({ featured: !current }).eq('id', id)
    fetchServices()
  }

  async function deleteService(id) {
    if (!confirm('¿Eliminar este servicio?')) return
    await supabase.from('services').update({ status: 'inactive' }).eq('id', id)
    fetchServices()
  }

  return (
    <div>
      <h1>Servicios</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Prestador</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {services.map((s) => (
              <tr key={s.id}>
                <td>
                  <Link to={`/servicio/${s.slug}`}>{s.title}</Link>{' '}
                  {s.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{s.profiles?.name}</td>
                <td>{s.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(s.id, s.featured)}>
                    {s.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteService(s.id)}>
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
