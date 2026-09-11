import { useState, useEffect, useCallback } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from '../hooks/useAuth'
import { TrashIcon, CheckIcon } from '../components/ui/Icons'
import './Notifications.css'

function formatRelativeTime(dateStr) {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  if (diffHours < 1) return 'Hace un rato'
  if (diffHours < 24) return `Hace ${diffHours}h`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 7) return `Hace ${diffDays}d`
  return new Date(dateStr).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })
}

export default function Notifications() {
  const { user, loading: authLoading } = useAuth()
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchNotifications = useCallback(async () => {
    if (!user) return
    setLoading(true)
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50)
    setNotifications(data || [])
    setLoading(false)
  }, [user])

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/ingresar?next=/notificaciones')
      return
    }
    fetchNotifications()
  }, [user, authLoading, navigate, fetchNotifications])

  async function markAsRead(id) {
    await supabase.from('notifications').update({ read: true }).eq('id', id)
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  async function markAllAsRead() {
    if (!user) return
    await supabase.from('notifications').update({ read: true }).eq('user_id', user.id).eq('read', false)
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
  }

  async function deleteNotification(id, e) {
    e.stopPropagation()
    e.preventDefault()
    await supabase.from('notifications').delete().eq('id', id)
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const hasUnread = notifications.some((n) => !n.read)

  if (authLoading) return null

  return (
    <div className="container notifications-page">
      <div className="notifications-header">
        <h1>Notificaciones</h1>
        {hasUnread && (
          <button className="btn btn-outline" onClick={markAllAsRead}>
            Marcar todas como leídas
          </button>
        )}
      </div>

      {loading && <p className="home-empty">Cargando...</p>}

      {!loading && notifications.length === 0 && (
        <p className="home-empty">
          Todavía no tenés notificaciones. Guardá una búsqueda como alerta y te vamos a avisar acá
          cuando aparezca algo nuevo.
        </p>
      )}

      <div className="notifications-list">
        {notifications.map((n) => (
          <Link
            key={n.id}
            to={n.link || '#'}
            className={`notification-row ${!n.read ? 'unread' : ''}`}
            onClick={() => !n.read && markAsRead(n.id)}
          >
            {!n.read && <span className="notification-dot" />}
            <div className="notification-row-body">
              <p className="notification-row-title">{n.title}</p>
              {n.body && <p className="notification-row-text">{n.body}</p>}
              <p className="notification-row-time">{formatRelativeTime(n.created_at)}</p>
            </div>
            <div className="notification-row-actions">
              {!n.read && (
                <button onClick={(e) => { e.stopPropagation(); e.preventDefault(); markAsRead(n.id) }} title="Marcar como leída">
                  <CheckIcon size={15} />
                </button>
              )}
              <button onClick={(e) => deleteNotification(n.id, e)} title="Eliminar">
                <TrashIcon size={15} />
              </button>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
