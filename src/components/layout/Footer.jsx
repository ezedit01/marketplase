import Logo, { APP_TAGLINE } from './Logo'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container footer-inner">
        <Logo variant="footer" />
        <p className="footer-tagline">{APP_TAGLINE}</p>
        <p className="footer-copy">© {new Date().getFullYear()}</p>
      </div>
    </footer>
  )
}
