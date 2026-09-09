import { NavLink } from 'react-router-dom'
import { HomeIcon, SearchIcon, PlusIcon, HeartIcon, UserIcon } from '../ui/Icons'
import { useAuth } from '../../hooks/useAuth'
import './BottomNav.css'

export default function BottomNav() {
  const { user } = useAuth()

  return (
    <nav className="bottom-nav">
      <NavLink to="/" end className="bottom-nav-item">
        <HomeIcon size={22} />
        <span>Inicio</span>
      </NavLink>
      <NavLink to="/buscar" className="bottom-nav-item">
        <SearchIcon size={22} />
        <span>Buscar</span>
      </NavLink>
      <NavLink to="/publicar" className="bottom-nav-item bottom-nav-publish">
        <span className="bottom-nav-publish-circle">
          <PlusIcon size={20} />
        </span>
      </NavLink>
      <NavLink to={user ? '/perfil/favoritos' : '/ingresar?next=/perfil/favoritos'} className="bottom-nav-item">
        <HeartIcon size={22} />
        <span>Favoritos</span>
      </NavLink>
      <NavLink to={user ? '/perfil' : '/ingresar'} className="bottom-nav-item">
        <UserIcon size={22} />
        <span>Perfil</span>
      </NavLink>
    </nav>
  )
}
