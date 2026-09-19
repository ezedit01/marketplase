import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { errandTypeLabel } from '../../utils/errands'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminErrands() {
  const [errands, setErrands] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchErrands = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('errands')
      .select(
        'id, slug, mode, errand_type, origin, status, featured, travel_destinations(name), profiles!errands_user_id_fkey(name)'
      )
      .order('created_at', { ascending: false })
      .limit(100)
    setErrands(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchErrands()
  }, [fetchErrands])

  async function toggleFeatured(id, current) {
    await supabase.from('errands').update({ featured: !current }).eq('id', id)
    fetchErrands()
  }

  async function deleteErrand(id) {
    if (!confirm('¿Eliminar esta comisión?')) return
    await supabase.from('errands').update({ status: 'deleted' }).eq('id', id)
    fetchErrands()
  }

  return (
    <div>
      <h1>Comisiones y encomiendas</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Ruta</th>
              <th>Tipo</th>
              <th>Publicado por</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {errands.map((e) => (
              <tr key={e.id}>
                <td>
                  <Link to={`/comision/${e.slug}`}>
                    {e.mode === 'ofrezco' ? 'Ofrezco' : 'Necesito'}: {e.origin} → {e.travel_destinations?.name}
                  </Link>{' '}
                  {e.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{errandTypeLabel(e.errand_type)}</td>
                <td>{e.profiles?.name}</td>
                <td>{e.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(e.id, e.featured)}>
                    {e.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteErrand(e.id)}>
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
