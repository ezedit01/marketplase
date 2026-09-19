import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { errandTypeLabel } from '../utils/errands'
import {
  StoreIcon,
  WrenchIcon,
  BriefcaseIcon,
  CalendarIcon,
  CarIcon,
  PackageIcon,
} from '../components/ui/Icons'
import './MyContent.css'

const STATUS_LABELS = {
  active: 'Activa',
  sold: 'Vendida',
  closed: 'Cerrado',
  completed: 'Finalizado',
  inactive: 'Inactivo',
  deleted: 'Eliminada',
}

export default function MyContent() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [sections, setSections] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ingresar?next=/perfil/publicaciones')
      return
    }
    if (!user) return

    async function fetchAll() {
      setLoading(true)

      const [businesses, services, jobs, events, trips, errands] = await Promise.all([
        supabase
          .from('businesses')
          .select('id, name, slug, status, created_at')
          .eq('owner_id', user.id)
          .neq('status', 'inactive')
          .order('created_at', { ascending: false }),
        supabase
          .from('services')
          .select('id, title, slug, status, created_at')
          .eq('provider_id', user.id)
          .neq('status', 'inactive')
          .order('created_at', { ascending: false }),
        supabase
          .from('jobs')
          .select('id, title, slug, status, created_at')
          .eq('poster_id', user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false }),
        supabase
          .from('events')
          .select('id, title, slug, status, created_at')
          .eq('organizer_id', user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false }),
        supabase
          .from('trips')
          .select('id, slug, origin, status, trip_date, travel_destinations(name)')
          .eq('user_id', user.id)
          .neq('status', 'deleted')
          .order('trip_date', { ascending: false }),
        supabase
          .from('errands')
          .select('id, slug, errand_type, status, created_at')
          .eq('user_id', user.id)
          .neq('status', 'deleted')
          .order('created_at', { ascending: false }),
      ])

      setSections({
        businesses: businesses.data || [],
        services: services.data || [],
        jobs: jobs.data || [],
        events: events.data || [],
        trips: trips.data || [],
        errands: errands.data || [],
      })
      setLoading(false)
    }

    fetchAll()
  }, [user, authLoading, navigate])

  if (authLoading || loading || !sections) return null

  const groups = [
    {
      key: 'businesses',
      title: 'Negocios',
      icon: StoreIcon,
      items: sections.businesses,
      link: (i) => `/negocio/${i.slug}`,
      label: (i) => i.name,
    },
    {
      key: 'services',
      title: 'Servicios',
      icon: WrenchIcon,
      items: sections.services,
      link: (i) => `/servicio/${i.slug}`,
      label: (i) => i.title,
    },
    {
      key: 'jobs',
      title: 'Empleos',
      icon: BriefcaseIcon,
      items: sections.jobs,
      link: (i) => `/empleo/${i.slug}`,
      label: (i) => i.title,
    },
    {
      key: 'events',
      title: 'Eventos',
      icon: CalendarIcon,
      items: sections.events,
      link: (i) => `/evento/${i.slug}`,
      label: (i) => i.title,
    },
    {
      key: 'trips',
      title: 'Viajes',
      icon: CarIcon,
      items: sections.trips,
      link: (i) => `/viaje/${i.slug}`,
      label: (i) => `${i.origin} → ${i.travel_destinations?.name || ''}`,
    },
    {
      key: 'errands',
      title: 'Comisiones y encomiendas',
      icon: PackageIcon,
      items: sections.errands,
      link: (i) => `/comision/${i.slug}`,
      label: (i) => errandTypeLabel(i.errand_type),
    },
  ]

  const totalItems = groups.reduce((sum, g) => sum + g.items.length, 0)

  return (
    <div className="container my-content-page">
      <Link to="/perfil" className="my-content-back">
        ← Mi perfil
      </Link>
      <h1>Negocios, servicios y más</h1>
      <p className="my-content-hint">
        Tus productos del marketplace se gestionan en la sección "Mis publicaciones" de tu
        perfil. Acá ves todo lo demás que publicaste en PUNTO: negocios, servicios, empleos,
        eventos, viajes y comisiones.
      </p>

      {totalItems === 0 && (
        <p className="home-empty">
          Todavía no publicaste ningún negocio, servicio, empleo, evento, viaje o comisión.{' '}
          <Link to="/publicar">Publicar algo</Link>
        </p>
      )}

      {groups
        .filter((g) => g.items.length > 0)
        .map((group) => (
          <div key={group.key} className="my-content-group">
            <div className="my-content-group-header">
              <group.icon size={17} />
              <h2>{group.title}</h2>
              <span className="my-content-count">({group.items.length})</span>
            </div>
            <div className="my-content-list">
              {group.items.map((item) => (
                <Link key={item.id} to={group.link(item)} className="my-content-row">
                  <span className="my-content-row-label">{group.label(item)}</span>
                  <span className={`my-content-status my-content-status-${item.status}`}>
                    {STATUS_LABELS[item.status] || item.status}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        ))}
    </div>
  )
}
