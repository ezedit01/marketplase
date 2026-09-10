import { useState, useRef, useEffect } from 'react'
import { CloseIcon, ChevronLeftIcon, ChevronRightIcon } from '../ui/Icons'
import './ImageLightbox.css'

// images: array de { url }. startIndex: con qué foto abrir.
export default function ImageLightbox({ images, startIndex = 0, onClose }) {
  const [index, setIndex] = useState(startIndex)
  const [zoomed, setZoomed] = useState(false)
  const touchStartX = useRef(null)
  const wrapRef = useRef(null)

  const hasMultiple = images.length > 1

  useEffect(() => {
    // Al cambiar de foto, volvemos a vista normal (evita quedar "perdido" dentro de un zoom)
    setZoomed(false)
    if (wrapRef.current) {
      wrapRef.current.scrollLeft = 0
      wrapRef.current.scrollTop = 0
    }
  }, [index])

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    }
    document.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index])

  function goPrev() {
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1))
  }

  function goNext() {
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1))
  }

  function handleImageClick(e) {
    e.stopPropagation()
    setZoomed((z) => !z)
  }

  function handleTouchStart(e) {
    if (zoomed) return
    touchStartX.current = e.touches[0].clientX
  }

  function handleTouchEnd(e) {
    if (zoomed || touchStartX.current == null) return
    const deltaX = e.changedTouches[0].clientX - touchStartX.current
    if (Math.abs(deltaX) > 50 && hasMultiple) {
      deltaX > 0 ? goPrev() : goNext()
    }
    touchStartX.current = null
  }

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <button className="lightbox-close" onClick={onClose} aria-label="Cerrar">
        <CloseIcon size={20} />
      </button>

      {hasMultiple && (
        <button
          className="lightbox-nav lightbox-nav-prev"
          onClick={(e) => {
            e.stopPropagation()
            goPrev()
          }}
          aria-label="Foto anterior"
        >
          <ChevronLeftIcon size={24} />
        </button>
      )}

      <div
        ref={wrapRef}
        className={`lightbox-image-wrap ${zoomed ? 'zoomed' : ''}`}
        onClick={handleImageClick}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img src={images[index].url} alt="" className={zoomed ? 'zoomed' : ''} />
      </div>

      {hasMultiple && (
        <button
          className="lightbox-nav lightbox-nav-next"
          onClick={(e) => {
            e.stopPropagation()
            goNext()
          }}
          aria-label="Foto siguiente"
        >
          <ChevronRightIcon size={24} />
        </button>
      )}

      {hasMultiple ? (
        <div className="lightbox-counter">
          {index + 1} / {images.length}
        </div>
      ) : (
        !zoomed && <p className="lightbox-hint">Tocá la foto para hacer zoom</p>
      )}
    </div>
  )
}
