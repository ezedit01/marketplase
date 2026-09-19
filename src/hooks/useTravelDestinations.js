import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useTravelDestinations() {
  const [destinations, setDestinations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('travel_destinations')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setDestinations(data || [])
        setLoading(false)
      })
  }, [])

  return { destinations, loading }
}
