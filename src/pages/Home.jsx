import { useListings } from '../hooks/useListings'
import { APP_TAGLINE } from '../components/layout/Logo'
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
          <p>Por ahora, comprá y vendé fácil en tu pueblo. Pronto, mucho más.</p>
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
    </div>
  )
}
