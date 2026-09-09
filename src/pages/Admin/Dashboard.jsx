import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabaseClient'

export default function Dashboard() {
  const [stats, setStats] = useState(null)

  useEffect(() => {
    async function loadStats() {
      const [users, activeListings, soldListings, pendingReports] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('listings').select('id', { count: 'exact', head: true }).eq('status', 'sold'),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ])

      setStats({
        users: users.count || 0,
        active: activeListings.count || 0,
        sold: soldListings.count || 0,
        reports: pendingReports.count || 0,
      })
    }
    loadStats()
  }, [])

  return (
    <div>
      <h1>Resumen</h1>
      {stats && (
        <div className="admin-stats">
          <div className="admin-stat-card">
            <p className="value">{stats.users}</p>
            <p className="label">Usuarios</p>
          </div>
          <div className="admin-stat-card">
            <p className="value">{stats.active}</p>
            <p className="label">Publicaciones activas</p>
          </div>
          <div className="admin-stat-card">
            <p className="value">{stats.sold}</p>
            <p className="label">Productos vendidos</p>
          </div>
          <div className="admin-stat-card">
            <p className="value">{stats.reports}</p>
            <p className="label">Reportes pendientes</p>
          </div>
        </div>
      )}
    </div>
  )
}
