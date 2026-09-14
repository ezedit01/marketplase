import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useServices } from '../hooks/useServices'
import { useServiceCategories } from '../hooks/useServiceCategories'
import ServiceCard from '../components/service/ServiceCard'
import { SearchIcon, PlusIcon } from '../components/ui/Icons'
import './Businesses.css'

export default function Services() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const { categories } = useServiceCategories()
  const { services, loading } = useServices({ search, categoryId })

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>Servicios</h1>
          <p>Profesionales y oficios de la comunidad.</p>
        </div>
        <Link to="/servicios/publicar" className="btn btn-primary businesses-add-btn">
          <PlusIcon size={16} />
          Ofrecer mi servicio
        </Link>
      </div>

      <div className="businesses-search">
        <SearchIcon size={18} className="businesses-search-icon" />
        <input
          type="text"
          placeholder="Buscar por tipo de servicio..."
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

      {!loading && services.length === 0 && (
        <p className="home-empty">No encontramos servicios con esos filtros.</p>
      )}

      <div className="businesses-grid">
        {services.map((s) => (
          <ServiceCard key={s.id} service={s} categoryName={categoryMap[s.category_id]} />
        ))}
      </div>
    </div>
  )
}
