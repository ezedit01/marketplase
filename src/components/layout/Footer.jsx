import { Link } from 'react-router-dom'
import Logo, { APP_TAGLINE } from './Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo variant="footer" />
        <p className="footer-tagline">{APP_TAGLINE}</p>
        <div className="footer-links">
          <Link to="/terminos">Términos y Condiciones</Link>
          <span className="footer-links-dot">·</span>
          <Link to="/privacidad">Privacidad</Link>
        </div>
        <p className="footer-copy">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
