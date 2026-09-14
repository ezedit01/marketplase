import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

export function useBusinessCategories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase
      .from('business_categories')
      .select('*')
      .order('order_index', { ascending: true })
      .then(({ data }) => {
        setCategories(data || [])
        setLoading(false)
      })
  }, [])

  return { categories, loading }
}
