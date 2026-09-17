import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminPromotions() {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchPromotions = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('promotions')
      .select('id, title, slug, status, featured, ends_at, businesses(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setPromotions(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchPromotions()
  }, [fetchPromotions])

  async function toggleFeatured(id, current) {
    await supabase.from('promotions').update({ featured: !current }).eq('id', id)
    fetchPromotions()
  }

  async function deletePromotion(id) {
    if (!confirm('¿Eliminar esta promoción?')) return
    await supabase.from('promotions').update({ status: 'inactive' }).eq('id', id)
    fetchPromotions()
  }

  return (
    <div>
      <h1>Promociones</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Negocio</th>
              <th>Vence</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((p) => (
              <tr key={p.id}>
                <td>
                  <Link to={`/promocion/${p.slug}`}>{p.title}</Link>{' '}
                  {p.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{p.businesses?.name}</td>
                <td>{p.ends_at || '—'}</td>
                <td>{p.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(p.id, p.featured)}>
                    {p.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deletePromotion(p.id)}>
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
