import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useEvents } from '../hooks/useEvents'
import { useEventCategories } from '../hooks/useEventCategories'
import EventCard from '../components/event/EventCard'
import { SearchIcon, PlusIcon } from '../components/ui/Icons'
import './Businesses.css'
import './Jobs.css'

export default function Events() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const { categories } = useEventCategories()
  const { events, loading } = useEvents({ search, categoryId })

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>Eventos</h1>
          <p>Qué está pasando en el pueblo, de hoy en adelante.</p>
        </div>
        <Link to="/eventos/publicar" className="btn btn-primary businesses-add-btn">
          <PlusIcon size={16} />
          Publicar evento
        </Link>
      </div>

      <div className="businesses-search">
        <SearchIcon size={18} className="businesses-search-icon" />
        <input
          type="text"
          placeholder="Buscar evento..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="businesses-category-pills">
        <button className={!categoryId ? 'active' : ''} onClick={() => setCategoryId(null)}>
          Todos
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            className={categoryId === cat.id ? 'active' : ''}
            onClick={() => setCategoryId(cat.id)}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && events.length === 0 && (
        <p className="home-empty">No hay eventos próximos con esos filtros.</p>
      )}

      <div className="jobs-list">
        {events.map((e) => (
          <EventCard key={e.id} event={e} categoryName={categoryMap[e.category_id]} />
        ))}
      </div>
    </div>
  )
}
