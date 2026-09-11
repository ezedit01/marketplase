import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, UserIcon, BellIcon } from '../ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import { useUnreadNotificationsCount } from '../../hooks/useNotifications'
import Logo from './Logo'
import './Header.css'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const unreadCount = useUnreadNotificationsCount()

  function handleSearchSubmit(e) {
    e.preventDefault()
    navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-logo">
          <Logo variant="header" />
        </Link>

        <form className="header-search" onSubmit={handleSearchSubmit}>
          <SearchIcon size={18} className="header-search-icon" />
          <input
            type="text"
            placeholder="¿Qué estás buscando?"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </form>

        <div className="header-actions">
          <Link to="/publicar" className="btn btn-primary header-publish-btn">
            <PlusIcon size={18} />
            <span>Publicar</span>
          </Link>

          {user && (
            <Link to="/notificaciones" className="header-bell-btn" aria-label="Notificaciones">
              <BellIcon size={19} />
              {unreadCount > 0 && (
                <span className="header-bell-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
              )}
            </Link>
          )}

          <Link to={user ? '/perfil' : '/ingresar'} className="header-account-btn" aria-label="Cuenta">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="header-account-avatar" />
            ) : (
              <UserIcon size={20} />
            )}
          </Link>
        </div>
      </div>
    </header>
  )
}
