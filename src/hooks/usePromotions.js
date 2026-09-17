import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { businessId } — si se pasa, trae solo las promos de ese negocio
// (incluye inactivas, para que el dueño las vea todas). Sin businessId,
// trae todas las activas y vigentes, para el directorio general /promociones.
export function usePromotions(filters = {}, { limit = 24 } = {}) {
  const [promotions, setPromotions] = useState([])
  const [loading, setLoading] = useState(true)

  const { businessId = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchPromotions() {
      setLoading(true)
      const today = new Date().toISOString().slice(0, 10)

      let query = supabase
        .from('promotions')
        .select('id, title, slug, discount_info, ends_at, status, featured, business_id, businesses(name, slug, logo_url)')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (businessId) {
        query = query.eq('business_id', businessId)
      } else {
        query = query.eq('status', 'active').or(`ends_at.is.null,ends_at.gte.${today}`)
      }

      const { data } = await query
      if (!cancelled) setPromotions(data || [])
      setLoading(false)
    }

    fetchPromotions()
    return () => {
      cancelled = true
    }
  }, [businessId, limit])

  return { promotions, loading }
}
