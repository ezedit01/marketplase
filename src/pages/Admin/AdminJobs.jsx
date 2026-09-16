import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabaseClient'
import { TrashIcon } from '../../components/ui/Icons'

export default function AdminJobs() {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchJobs = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase
      .from('jobs')
      .select('id, title, slug, status, featured, created_at, profiles!jobs_poster_id_fkey(name)')
      .order('created_at', { ascending: false })
      .limit(100)
    setJobs(data || [])
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchJobs()
  }, [fetchJobs])

  async function toggleFeatured(id, current) {
    await supabase.from('jobs').update({ featured: !current }).eq('id', id)
    fetchJobs()
  }

  async function deleteJob(id) {
    if (!confirm('¿Eliminar este aviso?')) return
    await supabase.from('jobs').update({ status: 'deleted' }).eq('id', id)
    fetchJobs()
  }

  return (
    <div>
      <h1>Empleos</h1>
      {loading ? (
        <p>Cargando...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Título</th>
              <th>Publicado por</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  <Link to={`/empleo/${j.slug}`}>{j.title}</Link>{' '}
                  {j.featured && <span className="admin-badge featured">Destacado</span>}
                </td>
                <td>{j.profiles?.name}</td>
                <td>{j.status}</td>
                <td className="admin-table-actions">
                  <button onClick={() => toggleFeatured(j.id, j.featured)}>
                    {j.featured ? 'Quitar destacado' : 'Destacar'}
                  </button>
                  <button onClick={() => deleteJob(j.id)}>
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
