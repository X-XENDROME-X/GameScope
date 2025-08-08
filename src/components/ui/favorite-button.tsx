import { Heart } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useFavorites } from '@/hooks/use-favorites'
import { useSession } from 'next-auth/react'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'
import { useState, useCallback } from 'react'

interface FavoriteButtonProps {
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
  className?: string
  showToast?: boolean
}

export function FavoriteButton({
  gameId,
  gameName,
  gameImage,
  gameRating,
  gameGenres,
  gamePlatforms,
  className,
  showToast = true
}: FavoriteButtonProps) {
  const { data: session } = useSession()
  const { 
    isFavorite, 
    addToFavorites, 
    removeFromFavorites, 
    loading, 
    isPending,
    getRealTimeCount 
  } = useFavorites()
  const [isProcessing, setIsProcessing] = useState(false)
  
  const gameIdStr = gameId.toString()
  const isInFavorites = isFavorite(gameIdStr)
  const currentCount = getRealTimeCount()
  const isAtLimit = currentCount >= 20 && !isInFavorites
  const gameIsPending = isPending(gameIdStr)
  const isDisabled = loading || isProcessing || gameIsPending

  const handleToggleFavorite = useCallback(async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // Prevent double clicks and concurrent operations
    if (isProcessing || gameIsPending || loading) return

    if (!session?.user) {
      if (showToast) {
        toast.error('Please sign in to add favorites', { 
          dedupeKey: 'auth-required'
        })
      }
      return
    }

    // Check limit for adding (use real-time count)
    const currentRealTimeCount = getRealTimeCount()
    if (!isInFavorites && currentRealTimeCount >= 20) {
      if (showToast) {
        toast.error(`Favorites limit reached (${currentRealTimeCount}/20)! Remove some favorites to add new games to your collection.`, {
          dedupeKey: 'favorites-limit',
          duration: 5000
        })
      }
      return
    }

    // Validate inputs
    if (!gameIdStr || gameIdStr.trim() === '' || !gameName || gameName.trim() === '') {
      if (showToast) {
        toast.error('Invalid game data', { dedupeKey: 'invalid-game' })
      }
      return
    }

    setIsProcessing(true)

    try {
      if (isInFavorites) {
        // Remove from favorites
        const result = await removeFromFavorites(gameIdStr)
        if (result.success && showToast) {
          // Use the actual returned count from the operation
          const actualNewCount = getRealTimeCount() // Get fresh count after operation
          toast.success(`${gameName} removed from favorites (${actualNewCount}/20)`)
        } else if (!result.success && showToast && result.error) {
          toast.error(result.error, { dedupeKey: 'remove-error' })
        }
      } else {
        // Add to favorites
        const result = await addToFavorites({
          gameId: gameIdStr,
          gameName,
          gameImage,
          gameRating,
          gameGenres,
          gamePlatforms
        })
        
        if (result.success && showToast) {
          // Use the actual returned count from the operation
          const actualNewCount = getRealTimeCount() // Get fresh count after operation
          if (actualNewCount === 20) {
            toast.success(`${gameName} added to favorites! You've reached the limit (${actualNewCount}/20)`, {
              duration: 4000
            })
          } else if (actualNewCount >= 18) {
            toast.success(`${gameName} added to favorites (${actualNewCount}/20) - Almost at limit!`, {
              duration: 3000
            })
          } else {
            toast.success(`${gameName} added to favorites (${actualNewCount}/20)`)
          }
        } else if (!result.success && showToast && result.error) {
          toast.error(result.error, { dedupeKey: 'add-error', duration: 5000 })
        }
      }
    } catch (err) {
      console.error('Favorite toggle error:', err)
      if (showToast) {
        const errorMessage = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
        toast.error(errorMessage, {
          dedupeKey: 'favorite-error',
          duration: 5000
        })
      }
    } finally {
      setIsProcessing(false)
    }
  }, [
    isProcessing, 
    gameIsPending, 
    loading, 
    session?.user, 
    isInFavorites, 
    gameIdStr, 
    gameName, 
    showToast, 
    removeFromFavorites, 
    addToFavorites, 
    gameImage, 
    gameRating, 
    gameGenres, 
    gamePlatforms,
    getRealTimeCount
  ])

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggleFavorite}
      disabled={isDisabled || isAtLimit}
      className={cn(
        "group relative h-8 w-8 p-0 transition-all duration-200 hover:scale-105",
        isInFavorites 
          ? "text-red-500 hover:text-red-600" 
          : isAtLimit
          ? "text-gray-300 cursor-not-allowed hover:scale-100 opacity-50"
          : "text-gray-400 hover:text-red-500",
        (loading || isProcessing || gameIsPending) && "opacity-50",
        className
      )}
      aria-label={
        gameIsPending
          ? "Processing..."
          : isAtLimit 
          ? "Favorites limit reached" 
          : isInFavorites 
          ? "Remove from favorites" 
          : "Add to favorites"
      }
      title={
        gameIsPending
          ? "Processing..."
          : isAtLimit 
          ? `You've reached the maximum of 20 favorites (${currentCount}/20). Remove some favorites to add new games.` 
          : isInFavorites 
          ? "Remove from favorites" 
          : `Add to favorites (${currentCount}/20)`
      }
    >
      <Heart 
        className={cn(
          "h-4 w-4 transition-all duration-200",
          isInFavorites 
            ? "fill-current scale-110" 
            : isAtLimit
            ? "opacity-50"
            : "group-hover:scale-110 group-hover:fill-red-500 group-hover:text-red-500 dark:group-hover:fill-red-400 dark:group-hover:text-red-400"
        )} 
      />
      
      {/* Loading indicator */}
      {(loading || isProcessing || gameIsPending) && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-800/80 rounded">
          <div className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
        </div>
      )}
      
      {/* Limit reached indicator */}
      {isAtLimit && !isInFavorites && !(loading || isProcessing || gameIsPending) && (
        <div className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full flex items-center justify-center">
          <span className="text-[8px] text-white font-bold">!</span>
        </div>
      )}
    </Button>
  )
}
