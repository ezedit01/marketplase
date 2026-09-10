import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

const SORT_OPTIONS = {
  recent: { column: 'created_at', ascending: false },
  price_asc: { column: 'price', ascending: true },
  price_desc: { column: 'price', ascending: false },
  most_viewed: { column: 'views', ascending: false },
}

// filters: { search, categoryId, minPrice, maxPrice, condition, sort, onlyWithPhoto }
export function useListings(filters = {}, { limit = 24 } = {}) {
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const {
    search = '',
    categoryId = null,
    minPrice = null,
    maxPrice = null,
    condition = null,
    sort = 'recent',
    onlyWithPhoto = false,
  } = filters

  useEffect(() => {
    let cancelled = false

    async function fetchListings() {
      setLoading(true)
      setError(null)

      let query = supabase
        .from('listings')
        .select(
          `
          id, title, slug, price, condition, location, created_at, featured, status, views,
          listing_images ( url, is_main )
        `
        )
        .eq('status', 'active')
        // Si van a filtrar por "solo con fotos" del lado del cliente, pedimos
        // un poco más de margen para no terminar con una página casi vacía.
        .limit(onlyWithPhoto ? limit * 2 : limit)

      if (search.trim()) {
        // websearch_to_tsquery tolera texto libre tipo "bicicleta rodado 26"
        query = query.textSearch('search_vector', search.trim(), {
          type: 'websearch',
          config: 'spanish',
        })
      }

      if (categoryId) query = query.eq('category_id', categoryId)
      if (minPrice != null) query = query.gte('price', minPrice)
      if (maxPrice != null) query = query.lte('price', maxPrice)
      if (condition) query = query.eq('condition', condition)

      const sortConfig = SORT_OPTIONS[sort] || SORT_OPTIONS.recent
      query = query
        .order('featured', { ascending: false })
        .order(sortConfig.column, { ascending: sortConfig.ascending })

      const { data, error: fetchError } = await query

      if (cancelled) return
      if (fetchError) {
        setError(fetchError.message)
        setListings([])
      } else {
        const rows = onlyWithPhoto
          ? (data || []).filter((l) => l.listing_images?.length > 0).slice(0, limit)
          : data || []
        setListings(rows)
      }
      setLoading(false)
    }

    fetchListings()
    return () => {
      cancelled = true
    }
  }, [search, categoryId, minPrice, maxPrice, condition, sort, onlyWithPhoto, limit])

  return { listings, loading, error }
}
