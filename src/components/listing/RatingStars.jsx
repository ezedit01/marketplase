import { useState } from 'react'
import './RatingStars.css'

// Modo lectura: RatingStars value={4.5} count={12}
// Modo interactivo: RatingStars interactive value={selected} onChange={setSelected}
export default function RatingStars({ value = 0, count, size = 16, interactive = false, onChange }) {
  const [hovered, setHovered] = useState(null)
  const displayValue = interactive && hovered != null ? hovered : value

  return (
    <span className={`rating-stars ${interactive ? 'interactive' : ''}`}>
      {[1, 2, 3, 4, 5].map((star) => {
        const filled = star <= Math.round(displayValue)
        return (
          <button
            key={star}
            type="button"
            className="rating-star"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(star)}
            onMouseEnter={() => interactive && setHovered(star)}
            onMouseLeave={() => interactive && setHovered(null)}
            aria-label={`${star} estrellas`}
          >
            <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={1.5}>
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          </button>
        )
      })}
      {count != null && <span className="rating-stars-count">({count})</span>}
    </span>
  )
}
