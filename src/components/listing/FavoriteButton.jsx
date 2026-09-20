import { useNavigate } from 'react-router-dom'
import { HeartIcon } from '../ui/Icons'
import { useFavorites } from '../../hooks/useFavorites'
import { useAuth } from '../../hooks/useAuth'
import './FavoriteButton.css'

// targetType: 'listing' | 'business' | 'service'
// variant: 'card' (chico, esquina de la tarjeta) | 'detail' (grande, con texto)
export default function FavoriteButton({ targetType = 'listing', targetId, variant = 'card' }) {
  const { user } = useAuth()
  const { isFavorite, toggleFavorite } = useFavorites()
  const navigate = useNavigate()
  const active = isFavorite(targetType, targetId)

  async function handleClick(e) {
    e.preventDefault()
    e.stopPropagation()

    if (!user) {
      navigate(`/ingresar?next=${encodeURIComponent(window.location.pathname)}`)
      return
    }
    toggleFavorite(targetType, targetId)
  }

  if (variant === 'detail') {
    return (
      <button
        className={`favorite-btn favorite-btn-detail ${active ? 'active' : ''}`}
        onClick={handleClick}
        aria-pressed={active}
      >
        <HeartIcon size={19} filled={active} />
        {active ? 'Guardado' : 'Guardar'}
      </button>
    )
  }

  if (variant === 'row') {
    return (
      <button
        className={`favorite-btn favorite-btn-row ${active ? 'active' : ''}`}
        onClick={handleClick}
        aria-pressed={active}
        aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
      >
        <HeartIcon size={17} filled={active} />
      </button>
    )
  }

  return (
    <button
      className={`favorite-btn favorite-btn-card ${active ? 'active' : ''}`}
      onClick={handleClick}
      aria-pressed={active}
      aria-label={active ? 'Quitar de favoritos' : 'Guardar en favoritos'}
    >
      <HeartIcon size={16} filled={active} />
    </button>
  )
}
