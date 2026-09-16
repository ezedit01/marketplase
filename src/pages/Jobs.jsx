import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useJobs } from '../hooks/useJobs'
import { useJobCategories } from '../hooks/useJobCategories'
import { EMPLOYMENT_TYPES } from '../utils/jobs'
import JobCard from '../components/job/JobCard'
import { SearchIcon, PlusIcon } from '../components/ui/Icons'
import './Businesses.css'
import './Jobs.css'

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState(null)
  const [employmentType, setEmploymentType] = useState('')
  const { categories } = useJobCategories()
  const { jobs, loading } = useJobs({ search, categoryId, employmentType: employmentType || null })

  const categoryMap = Object.fromEntries(categories.map((c) => [c.id, c.name]))

  return (
    <div className="container businesses-page">
      <div className="businesses-header">
        <div>
          <h1>Empleos</h1>
          <p>Búsquedas laborales en el pueblo.</p>
        </div>
        <Link to="/empleos/publicar" className="btn btn-primary businesses-add-btn">
          <PlusIcon size={16} />
          Publicar búsqueda
        </Link>
      </div>

      <div className="businesses-search">
        <SearchIcon size={18} className="businesses-search-icon" />
        <input
          type="text"
          placeholder="Buscar por puesto..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="businesses-category-pills">
        <button className={!categoryId ? 'active' : ''} onClick={() => setCategoryId(null)}>
          Todos los rubros
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

      <div className="jobs-type-select">
        <select value={employmentType} onChange={(e) => setEmploymentType(e.target.value)}>
          <option value="">Cualquier jornada</option>
          {EMPLOYMENT_TYPES.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && jobs.length === 0 && (
        <p className="home-empty">No encontramos búsquedas laborales con esos filtros.</p>
      )}

      <div className="jobs-list">
        {jobs.map((j) => (
          <JobCard key={j.id} job={j} categoryName={categoryMap[j.category_id]} />
        ))}
      </div>
    </div>
  )
}
