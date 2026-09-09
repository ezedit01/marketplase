import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminListings() {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchListings = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('listings')
      .select('id, title, slug, price, status, featured, created_at, profiles!listings_user_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setListings(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchListings()
  }, [fetchListings])

  async function toggleFeatured(id, current) {
    await supabase.from('listings').update({ featured: !current }).eq('id', id)
    fetchListings()
  }

  async function deleteListing(id) {
    if (!confirm('¿Eliminar esta publicación?')) return
    await supabase.from('listings').update({ status: 'deleted' }).eq('id', id)
    fetchListings()
  }

  return (
    <div>
      <h1>Publicaciones</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Vendedor</th>
              <th>Precio</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {listings.map((l) => (
              <tr key={l.id}>
                <td>
                  <Link to={`/producto/${l.slug}`}>{l.title}</Link>{' '}
                  {l.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{l.profiles?.name}</td>
                <td>{l.price ? `$${Number(l.price).toLocaleString('es-AR')}` : '-'}</td>
                <td>{l.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(l.id, l.featured)}>
                    {l.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteListing(l.id)}>
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
