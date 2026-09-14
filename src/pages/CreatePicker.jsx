import { Link } from 'react-router-dom'
import { TagIcon, StoreIcon, WrenchIcon } from '../components/ui/Icons'
import './CreatePicker.css'

const OPTIONS = [
  {
    to: '/publicar/producto',
    icon: TagIcon,
    title: 'Vender un producto',
    subtitle: 'Publicá algo para vender',
  },
  {
    to: '/negocios/publicar',
    icon: StoreIcon,
    title: 'Sumar mi negocio',
    subtitle: 'Registrá tu comercio',
  },
  {
    to: '/servicios/publicar',
    icon: WrenchIcon,
    title: 'Ofrecer un servicio',
    subtitle: 'Electricista, plomero, etc.',
  },
]

export default function CreatePicker() {
  return (
    <div className="container create-picker-page">
      <h1>¿Qué querés publicar?</h1>

      <div className="create-picker-grid">
        {OPTIONS.map((opt) => (
          <Link key={opt.to} to={opt.to} className="create-picker-card">
            <opt.icon size={26} className="create-picker-icon" />
            <p className="create-picker-title">{opt.title}</p>
            <p className="create-picker-subtitle">{opt.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
