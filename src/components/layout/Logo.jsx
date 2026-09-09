import './Logo.css'

export const APP_NAME = import.meta.env.VITE_APP_NAME || 'PUNTO'
export const APP_BY = import.meta.env.VITE_APP_BY || 'by KREA'
export const APP_TAGLINE =
  import.meta.env.VITE_APP_TAGLINE || 'El lugar digital de Sol de Julio.'

// El punto (círculo) es el ancla visual de la marca: literalmente "PUNTO".
// Se reutiliza como favicon y como marca de agua sutil en toda la interfaz.
export function BrandDot({ size = 10, className }) {
  return (
    <svg width={size} height={size} viewBox="0 0 10 10" className={className} aria-hidden="true">
      <circle cx="5" cy="5" r="5" fill="currentColor" />
    </svg>
  )
}

// variant: 'header' (compacto, para el header) | 'footer' (centrado, más espaciado)
export default function Logo({ variant = 'header' }) {
  return (
    <span className={`brand-logo brand-logo-${variant}`}>
      <span className="brand-logo-name">
        <BrandDot size={variant === 'footer' ? 12 : 9} className="brand-logo-dot" />
        {APP_NAME}
      </span>
      <span className="brand-logo-by">{APP_BY}</span>
    </span>
  )
}
