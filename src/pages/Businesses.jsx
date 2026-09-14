import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useBusinesses } from '../hooks/useBusinesses'
import { useBusinessCategories } from '../hooks/useBusinessCategories'
import BusinessCard from '../components/business/BusinessCard'
import { SearchIcon, PlusIcon } from '../components/ui/Icons'
import './Businesses.css'

export default function Businesses() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const { categories } = useBusinessCategories()
  const { businesses, loading } = useBusinesses({ search, categoryId })

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>Negocios locales</h1>
          <p>Comercios y emprendimientos de la comunidad.</p>
        </div>
        <Link to="/negocios/publicar" className="btn btn-primary businesses-add-btn">
          <PlusIcon size={16} />
          Sumar mi negocio
        </Link>
      </div>

      <div className="businesses-search">
        <SearchIcon size={18} className="businesses-search-icon" />
        <input
          type="text"
          placeholder="Buscar negocio por nombre..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="businesses-category-pills">
        <button
          className={!categoryId ? 'active' : ''}
          onClick={() => setCategoryId(null)}
        >
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

      {!loading && businesses.length === 0 && (
        <p className="home-empty">No encontramos negocios con esos filtros.</p>
      )}

      <div className="businesses-grid">
        {businesses.map((b) => (
          <BusinessCard key={b.id} business={b} categoryName={categoryMap[b.category_id]} />
        ))}
      </div>
    </div>
  )
}
