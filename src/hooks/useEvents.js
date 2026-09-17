import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { search, categoryId }
// Por defecto solo trae eventos de hoy en adelante, ordenados por fecha más próxima.
export function useEvents(filters = {}, { limit = 24 } = {}) {
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  const { search = '', categoryId = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchEvents() {
      setLoading(true)

      const today = new Date().toISOString().slice(0, 10)

      let query = supabase
        .from('events')
        .select('id, title, slug, location, event_date, event_time, category_id, featured, status')
        .eq('status', 'active')
        .gte('event_date', today)
        .order('featured', { ascending: false })
        .order('event_date', { ascending: true })
        .limit(limit)

      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data } = await query
      if (!cancelled) setEvents(data || [])
      setLoading(false)
    }

    fetchEvents()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, limit])

  return { events, loading }
}
