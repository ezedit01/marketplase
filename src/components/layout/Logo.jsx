import './Logo.css'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'PUNTO'
export const APP_BY = import.meta.env.VITE_APP_BY || 'by KREA'
export const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE || 'El lugar digital de Sol de Julio.'

// Ícono de marca real (PNG por ahora — cuando esté la versión vectorial,
// solo hay que cambiar este archivo por el .svg y todo lo demás sigue igual).
const LOGO_ICON_SRC = '/brand/logo-192.png'

// El texto se renderiza en vivo (no forma parte de la imagen) para que se
// vea nítido en cualquier tamaño, incluso siendo el ícono un PNG.
// variant: 'header' (compacto) | 'footer' (centrado, más espaciado)
export default function Logo({ variant = 'header' }) {
  return (
    <span className={`brand-logo brand-logo-${variant}`}>
      <img
        src={LOGO_ICON_SRC}
        alt={`${APP_NAME} ${APP_BY}`}
        className="brand-logo-icon"
        width={variant === 'footer' ? 56 : 34}
        height={variant === 'footer' ? 56 : 34}
      />
      <span className="brand-logo-text">
        <span className="brand-logo-name">{APP_NAME}</span>
        <span className="brand-logo-by">{APP_BY}</span>
      </span>
    </span>
  )
}
