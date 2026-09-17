import { Link } from 'react-router-dom'
import { CalendarIcon, MapPinIcon } from '../ui/Icons'
import { formatEventDate } from '../../utils/dates'
import './EventCard.css'

export default function EventCard({ event, categoryName }) {
  return (
    <Link to={`/evento/${event.slug}`} className="event-card">
      <div className="event-card-date">
        <CalendarIcon size={18} />
        <span>{formatEventDate(event.event_date)}</span>
      </div>
      <div className="event-card-body">
        <h3 className="event-card-title">{event.title}</h3>
        <div className="event-card-meta">
          {categoryName && <span>{categoryName}</span>}
          {event.event_time && <span>{event.event_time}</span>}
        </div>
        {event.location && (
          <p className="event-card-location">
            <MapPinIcon size={12} />
            {event.location}
          </p>
        )}
      </div>
      {event.featured && <span className="event-card-featured">Destacado</span>}
    </Link>
  )
}
