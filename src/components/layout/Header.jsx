import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { SearchIcon, PlusIcon, UserIcon } from '../ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import './Header.css'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Marketplace del Pueblo'

export default function Header() {
  const [query, setQuery] = useState('')
  const navigate = useNavigate()
  const { user } = useAuth()

  function handleSearchSubmit(e) {
    e.preventDefault()
    navigate(`/buscar?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <header className="header">
      <div className="container header-inner">
        <Link to="/" className="header-logo">
          {APP_NAME}
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

          <Link to={user ? '/perfil' : '/ingresar'} className="header-account-btn" aria-label="Cuenta">
            <UserIcon size={20} />
          </Link>
        </div>
      </div>
    </header>
  )
}
