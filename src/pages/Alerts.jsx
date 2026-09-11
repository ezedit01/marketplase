import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { useCategories } from '../hooks/useCategories'
import { TrashIcon } from '../components/ui/Icons'
import './Alerts.css'

function describeAlert(alert, categories) {
  const parts = []
  if (alert.query) parts.push(`"${alert.query}"`)
  const cat = categories.find((c) => c.id === alert.category_id)
  if (cat) parts.push(cat.name)
  if (alert.min_price != null) parts.push(`desde $${Number(alert.min_price).toLocaleString('es-AR')}`)
  if (alert.max_price != null) parts.push(`hasta $${Number(alert.max_price).toLocaleString('es-AR')}`)
  return parts.length > 0 ? parts.join(' · ') : 'Todas las publicaciones'
}

function alertToSearchUrl(alert, categories) {
  const params = new URLSearchParams()
  if (alert.query) params.set('q', alert.query)
  const cat = categories.find((c) => c.id === alert.category_id)
  if (cat) params.set('categoria', cat.slug)
  if (alert.min_price != null) params.set('min', alert.min_price)
  if (alert.max_price != null) params.set('max', alert.max_price)
  return `/buscar?${params.toString()}`
}

export default function Alerts() {
  const { user, loading: authLoading } = useAuth()
  const { categories } = useCategories()
  const navigate = useNavigate()
  const [alerts, setAlerts] = useState([])
  const [newCounts, setNewCounts] = useState({})
  const [loading, setLoading] = useState(true)

  const fetchAlerts = useCallback(async () => {
    if (!user) return
    setLoading(true)

    const { data } = await supabase
      .from('search_alerts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    setAlerts(data || [])
    setLoading(false)

    // Para cada alerta, contamos publicaciones activas creadas después de guardarla
    // que matcheen los mismos filtros. Es una comprobación "al entrar", no un push.
    const counts = {}
    await Promise.all(
      (data || []).map(async (alert) => {
        let q = supabase
          .from('listings')
          .select('id', { count: 'exact', head: true })
          .eq('status', 'active')
          .gt('created_at', alert.created_at)

        if (alert.query) {
          q = q.textSearch('search_vector', alert.query, { type: 'websearch', config: 'spanish' })
        }
        if (alert.category_id) q = q.eq('category_id', alert.category_id)
        if (alert.min_price != null) q = q.gte('price', alert.min_price)
        if (alert.max_price != null) q = q.lte('price', alert.max_price)

        const { count } = await q
        counts[alert.id] = count || 0
      })
    )
    setNewCounts(counts)
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ingresar?next=/perfil/alertas')
      return
    }
    fetchAlerts()
  }, [user, authLoading, navigate, fetchAlerts])

  async function deleteAlert(id) {
    await supabase.from('search_alerts').delete().eq('id', id)
    fetchAlerts()
  }

  if (authLoading) return null

  return (
    <div className="container alerts-page">
      <Link to="/perfil" className="alerts-back">
        ← Mi perfil
      </Link>
      <h1>Alertas guardadas</h1>
      <p className="alerts-explainer">
        Guardaste estas búsquedas desde la página de resultados. Cada una hora revisamos si
        apareció algo nuevo y te avisamos en la campanita (arriba a la derecha).
      </p>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && alerts.length === 0 && (
        <p className="home-empty">
          No guardaste ninguna alerta todavía. Buscá algo y usá "Guardar esta búsqueda".
        </p>
      )}

      <div className="alerts-list">
        {alerts.map((alert) => {
          const count = newCounts[alert.id]
          return (
            <div key={alert.id} className="alert-row">
              <div className="alert-row-info">
                <p className="alert-row-desc">{describeAlert(alert, categories)}</p>
                {count === undefined ? (
                  <p className="alert-row-count">Revisando...</p>
                ) : count > 0 ? (
                  <Link to={alertToSearchUrl(alert, categories)} className="alert-row-count alert-row-count-new">
                    {count} publicación{count !== 1 ? 'es' : ''} nueva{count !== 1 ? 's' : ''}
                  </Link>
                ) : (
                  <p className="alert-row-count">Sin novedades por ahora</p>
                )}
              </div>
              <button className="alert-row-delete" onClick={() => deleteAlert(alert.id)} title="Eliminar alerta">
                <TrashIcon size={16} />
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
