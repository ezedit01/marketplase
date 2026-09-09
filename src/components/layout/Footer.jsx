import './Footer.css'

const APP_NAME = import.meta.env.VITE_APP_NAME || 'Marketplace del Pueblo'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <p>
          {APP_NAME} · {new Date().getFullYear()}
        </p>
      </div>
    </footer>
  )
}
