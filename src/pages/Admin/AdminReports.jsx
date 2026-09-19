import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'

const REASON_LABELS = {
  estafa: 'Estafa',
  prohibido: 'Producto prohibido',
  inapropiado: 'Contenido inapropiado',
  falsa: 'Publicación falsa',
  otro: 'Otro',
}

export default function AdminReports() {
  const [reports, setReports] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('reports')
      .select('id, reason, details, status, created_at, listings(title, slug), trips(slug, origin), errands(slug, errand_type)')
      .order('created_at', { ascending: false })
    setReports(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchReports()
  }, [fetchReports])

  async function updateStatus(id, status) {
    await supabase.from('reports').update({ status }).eq('id', id)
    fetchReports()
  }

  function renderTarget(r) {
    if (r.listings) return <Link to={`/producto/${r.listings.slug}`}>{r.listings.title}</Link>
    if (r.trips) return <Link to={`/viaje/${r.trips.slug}`}>Viaje desde {r.trips.origin}</Link>
    if (r.errands) return <Link to={`/comision/${r.errands.slug}`}>Comisión: {r.errands.errand_type}</Link>
    return '(eliminado)'
  }

  return (
    <div>
      <h1>Reportes</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : reports.length === 0 ? (
        <p>No hay reportes.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Publicación</th>
              <th>Motivo</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{renderTarget(r)}</td>
                <td>{REASON_LABELS[r.reason]}</td>
                <td>
                  {r.status === 'pending' ? (
                    <span className="admin-badge pending">Pendiente</span>
                  ) : (
                    r.status
                  )}
                </td>
                <td className="admin-table-actions">
                  <button onClick={() => updateStatus(r.id, 'reviewed')}>Revisado</button>
                  <button onClick={() => updateStatus(r.id, 'dismissed')}>Descartar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}
