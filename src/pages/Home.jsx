import { Link } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { useBusinesses } from '../hooks/useBusinesses'
import { APP_TAGLINE } from '../components/layout/Logo'
import CategoryPills from '../components/listing/CategoryPills'
import ListingCard from '../components/listing/ListingCard'
import BusinessCard from '../components/business/BusinessCard'
import { useBusinessCategories } from '../hooks/useBusinessCategories'
import './Home.css'

export default function Home() {
  const { listings, loading } = useListings({ sort: 'recent' }, { limit: 24 })
  const { businesses, loading: businessesLoading } = useBusinesses({}, { limit: 6 })
  const { categories: businessCategories } = useBusinessCategories()
  const businessCategoryMap = Object.fromEntries(businessCategories.map((c) => [c.id, c.name]))

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>{APP_TAGLINE}</h1>
          <p>Comprá, vendé, y descubrí los negocios de tu pueblo — todo en un solo lugar.</p>
        </div>
      </section>

      <section className="container home-section">
        <CategoryPills />
      </section>

      <section className="container home-section">
        <h2>Últimas publicaciones</h2>

        {loading && <p className="home-empty">Cargando publicaciones...</p>}

        {!loading && listings.length === 0 && (
          <p className="home-empty">Todavía no hay publicaciones. ¡Sé el primero en publicar!</p>
        )}

        <div className="listing-grid">
          {listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      </section>

      {!businessesLoading && businesses.length > 0 && (
        <section className="container home-section">
          <div className="home-section-header">
            <h2>Negocios locales</h2>
            <Link to="/negocios" className="home-section-link">
              Ver todos
            </Link>
          </div>

          <div className="home-businesses-grid">
            {businesses.map((b) => (
              <BusinessCard key={b.id} business={b} categoryName={businessCategoryMap[b.category_id]} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
