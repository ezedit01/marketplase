import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useEventCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('event_categories')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setCategories(data || [])
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}
