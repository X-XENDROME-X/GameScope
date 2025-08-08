import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession } from 'next-auth/react'

export interface Favorite {
  id: string
  gameId: string
  gameName: string
  gameImage: string | null
  gameRating: string | null
  gameGenres: string | null
  gamePlatforms: string | null
  addedAt: string
}

export interface FavoriteGame {
  gameId: string
  gameName: string
  gameImage?: string
  gameRating?: number
  gameGenres?: string[]
  gamePlatforms?: Array<{
    platform: {
      id: number
      name: string
      slug: string
    }
  }>
}

// Global state for managing favorites across components
let globalFavorites: Favorite[] = []
const globalListeners: Set<() => void> = new Set()
let globalError: string | null = null
let globalLoading = false
const pendingOperations = new Map<string, 'adding' | 'removing'>()

const notifyListeners = () => {
  globalListeners.forEach(listener => listener())
}

export function useFavorites() {
  const { data: session } = useSession()
  const [, forceUpdate] = useState({})
  const [localError, setLocalError] = useState<string | null>(null)
  const fetchingRef = useRef(false)
  const lastSessionId = useRef<string | null>(null)
  
  // Force re-render when global state changes
  const triggerUpdate = useCallback(() => {
    forceUpdate({})
  }, [])

  // Subscribe to global state changes
  useEffect(() => {
    globalListeners.add(triggerUpdate)
    return () => {
      globalListeners.delete(triggerUpdate)
    }
  }, [triggerUpdate])

  // Fetch favorites with improved state management
  const fetchFavorites = useCallback(async (force = false) => {
    if (!session?.user?.email) {
      globalFavorites = []
      globalError = null
      globalLoading = false
      notifyListeners()
      return
    }

    // Prevent duplicate fetches unless forced
    if (fetchingRef.current && !force) return
    
    // Only fetch if session changed or forced
    if (!force && lastSessionId.current === session.user.email && globalFavorites.length > 0) {
      return
    }

    fetchingRef.current = true
    globalLoading = true
    globalError = null
    setLocalError(null)
    notifyListeners()

    try {
      const response = await fetch('/api/favorites', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch favorites')
      }

      const data = await response.json()
      globalFavorites = data.favorites || []
      lastSessionId.current = session.user.email
      globalError = null
      setLocalError(null)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch favorites'
      globalError = errorMessage
      setLocalError(errorMessage)
    } finally {
      globalLoading = false
      fetchingRef.current = false
      notifyListeners()
    }
  }, [session?.user?.email])

  // Enhanced add to favorites with better state management
  const addToFavorites = async (game: FavoriteGame): Promise<{ success: boolean; newCount: number; error?: string }> => {
    if (!session?.user) {
      const error = 'Please sign in to add favorites'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    const gameIdStr = game.gameId.toString()

    // Check if operation is already in progress
    if (pendingOperations.has(gameIdStr)) {
      const error = 'Operation already in progress'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    // Check if already exists
    if (globalFavorites.some(fav => fav.gameId === gameIdStr)) {
      const error = 'Game already in favorites'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    // Check limit
    if (globalFavorites.length >= 20) {
      const error = `Favorites limit reached (${globalFavorites.length}/20). Remove some favorites to add new games to your collection.`
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    // Mark operation as pending
    pendingOperations.set(gameIdStr, 'adding')
    globalError = null
    setLocalError(null)
    notifyListeners()

    // Create optimistic favorite
    const optimisticFavorite: Favorite = {
      id: 'temp-' + Date.now() + '-' + Math.random(),
      gameId: gameIdStr,
      gameName: game.gameName,
      gameImage: game.gameImage || null,
      gameRating: game.gameRating?.toString() || null,
      gameGenres: game.gameGenres?.join(', ') || null,
      gamePlatforms: game.gamePlatforms ? JSON.stringify(game.gamePlatforms) : null,
      addedAt: new Date().toISOString()
    }

    // Optimistic update
    globalFavorites = [...globalFavorites, optimisticFavorite]
    notifyListeners()

    try {
      const response = await fetch('/api/favorites', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          gameId: gameIdStr,
          gameName: game.gameName,
          gameImage: game.gameImage,
          gameRating: game.gameRating,
          gameGenres: game.gameGenres?.join(', '),
          gamePlatforms: game.gamePlatforms ? JSON.stringify(game.gamePlatforms) : null
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to add to favorites')
      }

      // Update with real data from server
      globalFavorites = globalFavorites.map(fav => 
        fav.id === optimisticFavorite.id 
          ? { ...optimisticFavorite, id: data.favoriteId || optimisticFavorite.id }
          : fav
      )
      
      notifyListeners()
      return { success: true, newCount: globalFavorites.length }
      
    } catch (err) {
      // Revert optimistic update on error
      globalFavorites = globalFavorites.filter(fav => fav.id !== optimisticFavorite.id)
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to add to favorites'
      globalError = errorMessage
      setLocalError(errorMessage)
      notifyListeners()
      
      return { success: false, newCount: globalFavorites.length, error: errorMessage }
    } finally {
      // Cleanup operation tracking
      pendingOperations.delete(gameIdStr)
      notifyListeners()
    }
  }

  // Enhanced remove from favorites with better state management
  const removeFromFavorites = async (gameId: string): Promise<{ success: boolean; newCount: number; error?: string }> => {
    if (!session?.user) {
      const error = 'Please sign in to remove favorites'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    const gameIdStr = gameId.toString()

    // Check if operation is already in progress
    if (pendingOperations.has(gameIdStr)) {
      const error = 'Operation already in progress'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    const existingFavorite = globalFavorites.find(fav => fav.gameId === gameIdStr)
    if (!existingFavorite) {
      const error = 'Game not in favorites'
      setLocalError(error)
      return { success: false, newCount: globalFavorites.length, error }
    }

    // Mark operation as pending
    pendingOperations.set(gameIdStr, 'removing')
    globalError = null
    setLocalError(null)
    notifyListeners()

    // Optimistic update
    globalFavorites = globalFavorites.filter(fav => fav.gameId !== gameIdStr)
    notifyListeners()

    try {
      const response = await fetch(`/api/favorites?gameId=${encodeURIComponent(gameIdStr)}`, {
        method: 'DELETE'
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to remove from favorites')
      }

      // Success - state already updated optimistically
      return { success: true, newCount: globalFavorites.length }
      
    } catch (err) {
      // Revert optimistic update on error
      globalFavorites = [...globalFavorites, existingFavorite]
      
      const errorMessage = err instanceof Error ? err.message : 'Failed to remove from favorites'
      globalError = errorMessage
      setLocalError(errorMessage)
      notifyListeners()
      
      return { success: false, newCount: globalFavorites.length, error: errorMessage }
    } finally {
      // Cleanup operation tracking
      pendingOperations.delete(gameIdStr)
      notifyListeners()
    }
  }

  // Check if game is in favorites
  const isFavorite = (gameId: string) => {
    return globalFavorites.some(fav => fav.gameId === gameId.toString())
  }

  // Check if operation is pending for a game
  const isPending = (gameId: string) => {
    return pendingOperations.has(gameId.toString())
  }

  // Get current favorites count
  const favoritesCount = globalFavorites.length

  // Get real-time count (same as favoritesCount now since we manage globally)
  const getRealTimeCount = () => {
    return globalFavorites.length
  }

  // Check if user can add more favorites
  const canAddMore = () => {
    return globalFavorites.length < 20
  }

  // Clear error automatically when conditions change
  useEffect(() => {
    const currentCount = globalFavorites.length
    if (currentCount < 20 && (globalError?.includes('limit reached') || localError?.includes('limit reached'))) {
      globalError = null
      setLocalError(null)
      notifyListeners()
    }
  }, [localError]) // Only depend on localError since globalFavorites changes are handled via listeners

  // Load favorites when user signs in
  useEffect(() => {
    const currentUser = session?.user
    const currentUserEmail = currentUser?.email
    
    if (currentUserEmail && lastSessionId.current !== currentUserEmail) {
      fetchFavorites(true)
    } else if (!currentUser) {
      // Clear state when user logs out
      globalFavorites = []
      globalError = null
      globalLoading = false
      lastSessionId.current = null
      pendingOperations.clear()
      setLocalError(null)
      notifyListeners()
    }
  }, [session?.user, fetchFavorites])

  return {
    favorites: globalFavorites,
    loading: globalLoading,
    error: globalError || localError,
    addToFavorites,
    removeFromFavorites,
    isFavorite,
    isPending,
    favoritesCount,
    getRealTimeCount,
    canAddMore,
    refetch: () => fetchFavorites(true)
  }
}
