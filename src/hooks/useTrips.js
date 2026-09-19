import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { destinationId }
export function useTrips(filters = {}, { limit = 24 } = {}) {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const { destinationId = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchTrips() {
      setLoading(true)
      const today = new Date().toISOString().slice(0, 10)

      let query = supabase
        .from('trips')
        .select(
          'id, slug, origin, destination_id, trip_date, departure_time, seats_available, round_trip, price, status, featured, travel_destinations(name)'
        )
        .eq('status', 'active')
        .gte('trip_date', today)
        .order('featured', { ascending: false })
        .order('trip_date', { ascending: true })
        .limit(limit)

      if (destinationId) query = query.eq('destination_id', destinationId)

      const { data } = await query
      if (!cancelled) setTrips(data || [])
      setLoading(false)
    }

    fetchTrips()
    return () => {
      cancelled = true
    }
  }, [destinationId, limit])

  return { trips, loading }
}
