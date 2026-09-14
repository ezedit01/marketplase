import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { search, categoryId }
export function useServices(filters = {}, { limit = 24 } = {}) {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)

  const { search = '', categoryId = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchServices() {
      setLoading(true)

      let query = supabase
        .from('services')
        .select(
          'id, title, slug, location, category_id, featured, profiles!services_provider_id_fkey(name, avatar_url)'
        )
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data } = await query
      if (!cancelled) setServices(data || [])
      setLoading(false)
    }

    fetchServices()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, limit])

  return { services, loading }
}
