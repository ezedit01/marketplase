import { Link } from 'react-router-dom'
import { useListings } from '../hooks/useListings'
import { APP_TAGLINE } from '../components/layout/Logo'
import { CompassIcon } from '../components/ui/Icons'
import CategoryPills from '../components/listing/CategoryPills'
import ListingCard from '../components/listing/ListingCard'
import './Home.css'

export default function Home() {
  const { listings, loading } = useListings({ sort: 'recent' }, { limit: 24 })

  return (
    <div className="home">
      <section className="hero">
        <div className="container">
          <h1>{APP_TAGLINE}</h1>
          <p>Comprá, vendé, y descubrí tu pueblo — todo en un solo lugar.</p>
        </div>
      </section>

      <section className="container home-section">
        <Link to="/explorar" className="home-explore-banner">
          <CompassIcon size={22} />
          <div>
            <p className="home-explore-title">Negocios, servicios y empleos</p>
            <p className="home-explore-subtitle">Todo lo que ofrece tu comunidad, en un solo lugar</p>
          </div>
        </Link>
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
    </div>
  )
}
