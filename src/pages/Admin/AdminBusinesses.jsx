import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminBusinesses() {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchBusinesses = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('businesses')
      .select('id, name, slug, status, featured, is_premium, created_at, profiles!businesses_owner_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setBusinesses(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchBusinesses()
  }, [fetchBusinesses])

  async function toggleFeatured(id, current) {
    await supabase.from('businesses').update({ featured: !current }).eq('id', id)
    fetchBusinesses()
  }

  async function togglePremium(id, current) {
    await supabase.from('businesses').update({ is_premium: !current }).eq('id', id)
    fetchBusinesses()
  }

  async function deleteBusiness(id) {
    if (!confirm('¿Eliminar este negocio?')) return
    await supabase.from('businesses').update({ status: 'inactive' }).eq('id', id)
    fetchBusinesses()
  }

  return (
    <div>
      <h1>Negocios</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Dueño</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {businesses.map((b) => (
              <tr key={b.id}>
                <td>
                  <Link to={`/negocio/${b.slug}`}>{b.name}</Link>{' '}
                  {b.featured && <span className="admin-badge featured">Destacado</span>}
                  {b.is_premium && <span className="admin-badge featured">Premium</span>}
                </td>
                <td>{b.profiles?.name}</td>
                <td>{b.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(b.id, b.featured)}>
                    {b.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => togglePremium(b.id, b.is_premium)}>
                    {b.is_premium ? 'Quitar premium' : 'Hacer premium'}
                  </button>
                  <button onClick={() => deleteBusiness(b.id)}>
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
