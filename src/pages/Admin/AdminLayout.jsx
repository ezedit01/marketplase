import { NavLink, Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import './Admin.css'

const LINKS = [
  { to: '/admin', label: 'Resumen', end: true },
  { to: '/admin/publicaciones', label: 'Publicaciones' },
  { to: '/admin/usuarios', label: 'Usuarios' },
  { to: '/admin/categorias', label: 'Categorías' },
  { to: '/admin/reportes', label: 'Reportes' },
]

export default function AdminLayout() {
  const { user, isAdmin, loading } = useAuth()

  if (loading) return null
  if (!user || !isAdmin) return <Navigate to="/" replace />

  return (
    <div className="container admin-layout">
      <aside className="admin-sidebar">
        {LINKS.map((link) => (
          <NavLink key={link.to} to={link.to} end={link.end} className="admin-nav-link">
            {link.label}
          </NavLink>
        ))}
      </aside>
      <main className="admin-content">
        <Outlet />
      </main>
    </div>
  )
}
