import { Link } from 'react-router-dom'
import { CarIcon, MapPinIcon } from '../ui/Icons'
import { formatEventDate } from '../../utils/dates'
import './TripCard.css'

export default function TripCard({ trip }) {
  const destinationName = trip.travel_destinations?.name

  return (
    <Link to={`/viaje/${trip.slug}`} className="trip-card">
      <div className="trip-card-icon">
        <CarIcon size={20} />
      </div>
      <div className="trip-card-body">
        <h3 className="trip-card-title">
          {trip.origin} → {destinationName}
        </h3>
        <div className="trip-card-meta">
          <span>{formatEventDate(trip.trip_date)}</span>
          {trip.departure_time && <span>{trip.departure_time}</span>}
          <span>
            {trip.seats_available} lugar{trip.seats_available !== 1 ? 'es' : ''}
          </span>
        </div>
        {trip.round_trip && (
          <p className="trip-card-roundtrip">
            <MapPinIcon size={12} />
            Ida y vuelta
          </p>
        )}
      </div>
      {trip.featured && <span className="trip-card-featured">Destacado</span>}
    </Link>
  )
}
