import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// filters: { search, categoryId, employmentType }
export function useJobs(filters = {}, { limit = 24 } = {}) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)

  const { search = '', categoryId = null, employmentType = null } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchJobs() {
      setLoading(true)

      let query = supabase
        .from('jobs')
        .select('id, title, slug, location, category_id, employment_type, status, featured, created_at')
        .eq('status', 'active')
        .order('featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(limit)

      if (search.trim()) query = query.ilike('title', `%${search.trim()}%`)
      if (categoryId) query = query.eq('category_id', categoryId)
      if (employmentType) query = query.eq('employment_type', employmentType)

      const { data } = await query
      if (!cancelled) setJobs(data || [])
      setLoading(false)
    }

    fetchJobs()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, employmentType, limit])

  return { jobs, loading }
}
