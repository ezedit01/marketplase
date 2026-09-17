import { Link } from 'react-router-dom'
import { APP_NAME } from '../components/layout/Logo'
import { SearchIcon, TagIcon, WhatsappIcon, ShareIcon, CompassIcon } from '../components/ui/Icons'
import './HowItWorks.css'

const STEPS = [
  {
    icon: SearchIcon,
    title: 'Buscá',
    text: 'Productos, negocios, servicios, empleos y eventos de Sol de Julio, todo en un solo lugar.',
  },
  {
    icon: TagIcon,
    title: 'Publicá',
    text: 'Tocá el botón "+" y elegí qué querés publicar. Es gratis y no tarda más de un minuto.',
  },
  {
    icon: WhatsappIcon,
    title: 'Contactá',
    text: 'Cada publicación tiene un botón que abre WhatsApp con un mensaje ya armado. La conversación y el acuerdo son directamente entre ustedes.',
  },
  {
    icon: ShareIcon,
    title: 'Compartí',
    text: 'Cualquier publicación se puede compartir con un link — al mandarlo por WhatsApp se ve la foto y el precio automáticamente.',
  },
]

export default function HowItWorks() {
  return (
    <div className="container how-it-works-page">
      <h1>¿Cómo funciona {APP_NAME}?</h1>
      <p className="how-it-works-intro">
        {APP_NAME} es el lugar digital de Sol de Julio: comprá, vendé, y descubrí los
        negocios, servicios, empleos y eventos de tu pueblo.
      </p>

      <div className="how-it-works-steps">
        {STEPS.map((step) => (
          <div key={step.title} className="how-it-works-step">
            <div className="how-it-works-step-icon">
              <step.icon size={22} />
            </div>
            <div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
            </div>
          </div>
        ))}
      </div>

      <h2>Algunos consejos para comprar y vender seguro</h2>
      <ul className="how-it-works-tips">
        <li>Preferí encontrarte en lugares públicos para entregar o retirar productos.</li>
        <li>Si es posible, revisá el producto antes de pagar.</li>
        <li>Desconfiá de precios demasiado bajos para ser reales, y de pedidos de pago por adelantado sin conocer al vendedor.</li>
        <li>Podés reportar cualquier publicación sospechosa desde el botón "Reportar" en su página.</li>
        <li>Las calificaciones de vendedores te ayudan a decidir, pero no reemplazan tu propio criterio.</li>
      </ul>

      <div className="how-it-works-cta">
        <Link to="/explorar" className="btn btn-primary">
          <CompassIcon size={17} />
          Explorar {APP_NAME}
        </Link>
      </div>
    </div>
  )
}
