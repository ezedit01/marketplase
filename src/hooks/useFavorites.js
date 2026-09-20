import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

const COLUMN_BY_TYPE = { listing: 'listing_id', business: 'business_id', service: 'service_id' }

function key(targetType, targetId) {
  return `${targetType}:${targetId}`
}

// Maneja el set de favoritos del usuario actual (productos, negocios y
// servicios, todo junto) + función para togglear. Se carga una sola vez
// por sesión y se actualiza optimistamente al togglear, así el corazón
// responde al instante sin esperar la vuelta del servidor.
export function useFavorites() {
  const { user } = useAuth()
  const [favoriteKeys, setFavoriteKeys] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoriteKeys(new Set())
      setLoading(false)
      return
    }

    let cancelled = false
    supabase
      .from('favorites')
      .select('listing_id, business_id, service_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (cancelled) return
        const keys = (data || []).map((f) => {
          if (f.listing_id) return key('listing', f.listing_id)
          if (f.business_id) return key('business', f.business_id)
          return key('service', f.service_id)
        })
        setFavoriteKeys(new Set(keys))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const isFavorite = useCallback(
    (targetType, targetId) => favoriteKeys.has(key(targetType, targetId)),
    [favoriteKeys]
  )

  const toggleFavorite = useCallback(
    async (targetType, targetId) => {
      if (!user) return { needsAuth: true }

      const k = key(targetType, targetId)
      const wasFavorite = favoriteKeys.has(k)
      const column = COLUMN_BY_TYPE[targetType]

      // Update optimista
      setFavoriteKeys((prev) => {
        const next = new Set(prev)
        if (wasFavorite) next.delete(k)
        else next.add(k)
        return next
      })

      if (wasFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq(column, targetId)
        if (error) {
          setFavoriteKeys((prev) => new Set(prev).add(k))
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, [column]: targetId })
        if (error) {
          setFavoriteKeys((prev) => {
            const next = new Set(prev)
            next.delete(k)
            return next
          })
        }
      }

      return { needsAuth: false }
    },
    [user, favoriteKeys]
  )

  return { isFavorite, toggleFavorite, loading }
}
