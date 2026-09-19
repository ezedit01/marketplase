import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { destinationId, errandType, mode }
export function useErrands(filters = {}, { limit = 24 } = {}) {
  const [errands, setErrands] = useState([])
  const [loading, setLoading] = useState(true)

  const { destinationId = null, errandType = null, mode = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchErrands() {
      setLoading(true)

      let query = supabase
        .from('errands')
        .select(
          'id, slug, mode, errand_type, origin, destination_id, errand_date, budget, status, featured, created_at, travel_destinations(name)'
        )
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (destinationId) query = query.eq('destination_id', destinationId)
      if (errandType) query = query.eq('errand_type', errandType)
      if (mode) query = query.eq('mode', mode)

      const { data } = await query
      if (!cancelled) setErrands(data || [])
      setLoading(false)
    }

    fetchErrands()
    return () => {
      cancelled = true
    }
  }, [destinationId, errandType, mode, limit])

  return { errands, loading }
}
