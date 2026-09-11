import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

// Solo trae el conteo (liviano, para el badge de la campanita). La lista
// completa se pide aparte en la página /notificaciones.
export function useUnreadNotificationsCount() {
  const { user } = useAuth()
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!user) {
      setCount(0)
      return
    }

    let cancelled = false

    async function fetchCount() {
      const { count: unread } = await supabase
        .from('notifications')
        .select('id', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .eq('read', false)

      if (!cancelled) setCount(unread || 0)
    }

    fetchCount()
    // Sin realtime por ahora: se refresca cada vez que se monta el Header
    // (o sea, en cada navegación) y cuando la pestaña vuelve a tener foco.
    window.addEventListener('focus', fetchCount)
    return () => {
      cancelled = true
      window.removeEventListener('focus', fetchCount)
    }
  }, [user])

  return count
}
