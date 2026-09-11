import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useCategories } from '../hooks/useCategories'
import ListingCard from '../components/listing/ListingCard'
import SaveAlertButton from '../components/listing/SaveAlertButton'
import './Search.css'

export default function Search() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { categories } = useCategories()

  const [minPrice, setMinPrice] = useState(searchParams.get('min') || '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('max') || '')

  const query = searchParams.get('q') || ''
  const categorySlug = searchParams.get('categoria') || ''
  const categoryIdParam = searchParams.get('categoria_id')
  const condition = searchParams.get('estado') || ''
  const sort = searchParams.get('orden') || 'recent'
  const onlyWithPhoto = searchParams.get('fotos') === '1'

  const activeCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)
    : categoryIdParam
      ? categories.find((c) => c.id === Number(categoryIdParam))
      : null

  const { listings, loading } = useListings({
    search: query,
    categoryId: activeCategory?.id || null,
    minPrice: minPrice ? Number(minPrice) : null,
    maxPrice: maxPrice ? Number(maxPrice) : null,
    condition: condition || null,
    sort,
    onlyWithPhoto,
  })

  function updateParam(key, value) {
    const next = new URLSearchParams(searchParams)
    if (value) next.set(key, value)
    else next.delete(key)
    setSearchParams(next)
  }

  function applyPriceFilter(e) {
    e.preventDefault()
    updateParam('min', minPrice)
    updateParam('max', maxPrice)
  }

  useEffect(() => {
    setMinPrice(searchParams.get('min') || '')
    setMaxPrice(searchParams.get('max') || '')
  }, [searchParams])

  const hasActiveFilters = query || categorySlug || condition || minPrice || maxPrice

  return (
    <div className="container search-page">
      <aside className="search-filters">
        <h3>Filtros</h3>

        <div className="filter-group">
          <label>Categoría</label>
          <select
            value={categorySlug}
            onChange={(e) => updateParam('categoria', e.target.value)}
          >
            <option value="">Todas</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Precio</label>
          <form className="price-inputs" onSubmit={applyPriceFilter}>
            <input
              type="number"
              placeholder="Mín"
              value={minPrice}
              onChange={(e) => setMinPrice(e.target.value)}
            />
            <input
              type="number"
              placeholder="Máx"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
            />
            <button type="submit" className="btn btn-outline">
              Aplicar
            </button>
          </form>
        </div>

        <div className="filter-group">
          <label>Estado</label>
          <select value={condition} onChange={(e) => updateParam('estado', e.target.value)}>
            <option value="">Todos</option>
            <option value="new">Nuevo</option>
            <option value="used">Usado</option>
          </select>
        </div>

        <div className="filter-group">
          <label className="filter-checkbox">
            <input
              type="checkbox"
              checked={onlyWithPhoto}
              onChange={(e) => updateParam('fotos', e.target.checked ? '1' : '')}
            />
            Solo con fotos
          </label>
        </div>

        <div className="filter-group">
          <label>Ordenar por</label>
          <select value={sort} onChange={(e) => updateParam('orden', e.target.value)}>
            <option value="recent">Más recientes</option>
            <option value="most_viewed">Más consultados</option>
            <option value="price_asc">Menor precio</option>
            <option value="price_desc">Mayor precio</option>
          </select>
        </div>

        {hasActiveFilters && (
          <SaveAlertButton
            query={query}
            categoryId={activeCategory?.id || null}
            minPrice={minPrice ? Number(minPrice) : null}
            maxPrice={maxPrice ? Number(maxPrice) : null}
          />
        )}
      </aside>

      <main className="search-results">
        <p className="search-results-count">
          {loading ? 'Buscando...' : `${listings.length} resultado${listings.length !== 1 ? 's' : ''}`}
          {query && ` para "${query}"`}
        </p>

        {!loading && listings.length === 0 && (
          <p className="home-empty">No encontramos publicaciones con esos filtros.</p>
        )}

        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </main>
    </div>
  )
}
