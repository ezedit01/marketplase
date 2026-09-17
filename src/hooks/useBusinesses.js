import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { search, categoryId }
export function useBusinesses(filters = {}, { limit = 24 } = {}) {
  const [businesses, setBusinesses] = useState([])
  const [loading, setLoading] = useState(true)

  const { search = '', categoryId = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchBusinesses() {
      setLoading(true)

      let query = supabase
        .from('businesses')
        .select('id, name, slug, logo_url, address, category_id, featured, is_premium')
        .eq('status', 'active')
        .order('is_premium', { ascending: false })
        .order('featured', { ascending: false })
        .order('name', { ascending: true })
        .limit(limit)

      if (search.trim()) query = query.ilike('name', `%${search.trim()}%`)
      if (categoryId) query = query.eq('category_id', categoryId)

      const { data } = await query
      if (!cancelled) setBusinesses(data || [])
      setLoading(false)
    }

    fetchBusinesses()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, limit])

  return { businesses, loading }
}
