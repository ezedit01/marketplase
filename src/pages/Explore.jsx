import { Link } from 'react-router-dom'
import { StoreIcon, WrenchIcon, BriefcaseIcon, CalendarIcon, PercentIcon, CarIcon } from '../components/ui/Icons'
import './CreatePicker.css'

const SECTIONS = [
  {
    to: '/negocios',
    icon: StoreIcon,
    title: 'Negocios',
    subtitle: 'Comercios del pueblo',
  },
  {
    to: '/servicios',
    icon: WrenchIcon,
    title: 'Servicios',
    subtitle: 'Oficios y profesionales',
  },
  {
    to: '/empleos',
    icon: BriefcaseIcon,
    title: 'Empleos',
    subtitle: 'Búsquedas laborales',
  },
  {
    to: '/eventos',
    icon: CalendarIcon,
    title: 'Eventos',
    subtitle: 'Qué está pasando',
  },
  {
    to: '/promociones',
    icon: PercentIcon,
    title: 'Promociones',
    subtitle: 'Ofertas y descuentos',
  },
  {
    to: '/viajes',
    icon: CarIcon,
    title: 'PUNTO Viajes',
    subtitle: 'Viajes, comisiones y encomiendas',
  },
]

export default function Explore() {
  return (
    <div className="container create-picker-page">
      <h1>Explorá tu pueblo</h1>

      <div className="create-picker-grid">
        {SECTIONS.map((s) => (
          <Link key={s.to} to={s.to} className="create-picker-card">
            <s.icon size={26} className="create-picker-icon" />
            <p className="create-picker-title">{s.title}</p>
            <p className="create-picker-subtitle">{s.subtitle}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
