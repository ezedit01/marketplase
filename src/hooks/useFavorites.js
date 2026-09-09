import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabaseClient'
import { useAuth } from './useAuth'

// Maneja el set de IDs favoritos del usuario actual + función para togglear.
// Se carga una sola vez por sesión y se actualiza optimistamente al togglear,
// así el corazón responde al instante sin esperar la vuelta del servidor.
export function useFavorites() {
  const { user } = useAuth()
  const [favoriteIds, setFavoriteIds] = useState(new Set())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setFavoriteIds(new Set())
      setLoading(false)
      return
    }

    let cancelled = false
    supabase
      .from('favorites')
      .select('listing_id')
      .eq('user_id', user.id)
      .then(({ data }) => {
        if (cancelled) return
        setFavoriteIds(new Set((data || []).map((f) => f.listing_id)))
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user])

  const isFavorite = useCallback((listingId) => favoriteIds.has(listingId), [favoriteIds])

  const toggleFavorite = useCallback(
    async (listingId) => {
      if (!user) return { needsAuth: true }

      const wasFavorite = favoriteIds.has(listingId)

      // Update optimista
      setFavoriteIds((prev) => {
        const next = new Set(prev)
        if (wasFavorite) next.delete(listingId)
        else next.add(listingId)
        return next
      })

      if (wasFavorite) {
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', user.id)
          .eq('listing_id', listingId)
        if (error) {
          // revertir si falló
          setFavoriteIds((prev) => new Set(prev).add(listingId))
        }
      } else {
        const { error } = await supabase
          .from('favorites')
          .insert({ user_id: user.id, listing_id: listingId })
        if (error) {
          setFavoriteIds((prev) => {
            const next = new Set(prev)
            next.delete(listingId)
            return next
          })
        }
      }

      return { needsAuth: false }
    },
    [user, favoriteIds]
  )

  return { isFavorite, toggleFavorite, loading }
}
