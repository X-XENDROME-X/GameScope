'use client'

import { useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useFavorites } from '@/hooks/use-favorites'
import { Heart, Trash2, Star, Calendar, Grid, List, Search, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { OptimizedImage } from '@/components/ui/optimized-image'
import { PlatformIcon } from '@/components/ui/platform-icons'
import { PlatformUtils } from '@/lib/platform-utils'
import { SearchHighlight, SearchStats, NoSearchResults } from '@/components/game/search-enhancements'
import { cn } from '@/lib/utils'
import { toast } from '@/lib/toast'

type ViewMode = 'grid' | 'list'
type SortOption = 'newest' | 'oldest' | 'name_asc' | 'name_desc' | 'rating_high' | 'rating_low'

// Helper function to get width percentage class
const getProgressWidth = (count: number, total: number): string => {
  const percentage = Math.min((count / total) * 100, 100)
  if (percentage === 0) return 'w-0'
  if (percentage <= 5) return 'w-1'
  if (percentage <= 10) return 'w-2'
  if (percentage <= 15) return 'w-3'
  if (percentage <= 20) return 'w-4'
  if (percentage <= 25) return 'w-5'
  if (percentage <= 30) return 'w-6'
  if (percentage <= 35) return 'w-7'
  if (percentage <= 40) return 'w-8'
  if (percentage <= 45) return 'w-9'
  if (percentage <= 50) return 'w-10'
  if (percentage <= 55) return 'w-11'
  if (percentage <= 60) return 'w-12'
  if (percentage <= 65) return 'w-16'
  if (percentage <= 70) return 'w-20'
  if (percentage <= 75) return 'w-24'
  if (percentage <= 80) return 'w-32'
  if (percentage <= 85) return 'w-36'
  if (percentage <= 90) return 'w-40'
  if (percentage <= 95) return 'w-44'
  return 'w-48'
}

// Helper function to parse platforms from JSON string
const parsePlatforms = (platformsStr: string | null): Array<{
  platform: { id: number; name: string; slug: string }
}> => {
  if (!platformsStr) return []
  try {
    const parsed = JSON.parse(platformsStr)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

// Helper function to get default platforms if none are stored
const getDefaultPlatforms = (): Array<{
  platform: { id: number; name: string; slug: string }
}> => {
  // Default platforms based on common gaming platforms
  return [
    { platform: { id: 4, name: 'PC', slug: 'pc' } },
    { platform: { id: 187, name: 'PlayStation 5', slug: 'playstation5' } },
    { platform: { id: 1, name: 'Xbox One', slug: 'xbox-one' } }
  ]
}

export default function FavoritesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { favorites, getRealTimeCount, loading, removeFromFavorites } = useFavorites()
  
  // Get real-time count for more accurate UI updates
  const currentCount = getRealTimeCount()
  
  // UI State
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('newest')
  const [isRemoving, setIsRemoving] = useState<string | null>(null)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isNavigatingHome, setIsNavigatingHome] = useState(false)

  // Enhanced filter and sort favorites with advanced search similar to main page
  const filteredAndSortedFavorites = favorites
    .filter(fav => {
      if (!searchQuery.trim()) return true
      
      const query = searchQuery.toLowerCase().trim()
      const gameName = fav.gameName.toLowerCase()
      const gameGenres = (fav.gameGenres || '').toLowerCase()
      
      // Advanced search logic similar to main page
      // Check for exact matches first
      if (gameName.includes(query)) return true
      if (gameGenres.includes(query)) return true
      
      // Check for individual words in the search query
      const queryWords = query.split(/\s+/).filter(word => word.length > 1)
      const nameWords = gameName.split(/\s+/)
      const genreWords = gameGenres.split(/[\s,]+/)
      
      // Check if any query word matches any name or genre word
      return queryWords.some(queryWord => 
        nameWords.some(nameWord => nameWord.includes(queryWord)) ||
        genreWords.some(genreWord => genreWord.includes(queryWord))
      )
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime()
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime()
        case 'name_asc':
          return a.gameName.localeCompare(b.gameName)
        case 'name_desc':
          return b.gameName.localeCompare(a.gameName)
        case 'rating_high':
          return (parseFloat(b.gameRating || '0') - parseFloat(a.gameRating || '0'))
        case 'rating_low':
          return (parseFloat(a.gameRating || '0') - parseFloat(b.gameRating || '0'))
        default:
          return 0
      }
    })

  const handleRemoveFavorite = async (gameId: string, gameName: string) => {
    if (!confirm(`Remove "${gameName}" from your favorites?`)) return
    
    setIsRemoving(gameId)
    const success = await removeFromFavorites(gameId)
    
    if (success) {
      toast.success(`${gameName} removed from favorites`)
    } else {
      toast.error('Failed to remove from favorites')
    }
    setIsRemoving(null)
  }

  const handleDiscoverMore = () => {
    setIsNavigating(true)
    router.push('/')
  }

  const handleNavigateHome = () => {
    setIsNavigatingHome(true)
    router.push('/')
  }

  // Loading State
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your favorites...</p>
        </div>
      </div>
    )
  }

  // Not Authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
            Sign in to View Favorites
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Create an account or sign in to start building your personalized collection of favorite games.
          </p>
          <Button 
            size="lg" 
            onClick={handleNavigateHome}
            disabled={isNavigatingHome}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isNavigatingHome ? (
              <>
                <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                Loading...
              </>
            ) : (
              <>
                <Home className="w-5 h-5 mr-2" />
                Back to Home
              </>
            )}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-pink-600 to-purple-600 rounded-2xl p-6 text-white">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                {/* Home Button */}
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={handleNavigateHome}
                  disabled={isNavigatingHome}
                  className="text-white hover:text-white hover:bg-gradient-to-r hover:from-white/20 hover:to-white/10 border border-white/30 hover:border-white/50 transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95 group backdrop-blur-sm"
                  title="Back to Home"
                >
                  {isNavigatingHome ? (
                    <div className="w-4 h-4 sm:mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Home className="w-4 h-4 sm:mr-2 transition-all duration-300 group-hover:rotate-12 group-hover:scale-110" />
                  )}
                  <span className="hidden sm:inline">
                    {isNavigatingHome ? 'Loading...' : 'Home'}
                  </span>
                </Button>
                
                {/* Title Section */}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 fill-current" />
                    My Favorite Games
                  </h1>
                  <p className="text-pink-100 mt-2 text-sm sm:text-base">
                    Your personalized collection of amazing games
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${currentCount >= 20 ? 'bg-red-400' : currentCount >= 18 ? 'bg-yellow-400' : currentCount >= 15 ? 'bg-orange-400' : 'bg-green-400'}`}></div>
                  <span className="text-sm text-pink-100">
                    {currentCount}/20 games saved
                  </span>
                </div>
                <div className="w-48 bg-pink-600/30 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      currentCount >= 20 ? 'bg-red-400' : 
                      currentCount >= 18 ? 'bg-yellow-400' : 
                      currentCount >= 15 ? 'bg-orange-400' : 
                      'bg-green-400'
                    } ${getProgressWidth(currentCount, 20)}`}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {loading ? (
          // Loading State
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your favorites...</p>
          </div>
        ) : favorites.length === 0 ? (
          // Empty State
          <div className="text-center py-16">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-12 max-w-md mx-auto">
              <Heart className="w-20 h-20 text-gray-400 mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                No favorites yet
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-8">
                Start exploring games and click the heart icon to add them to your favorites. You can save up to 20 games!
              </p>
              <Button 
                size="lg" 
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg"
                onClick={handleDiscoverMore}
                disabled={isNavigating}
              >
                {isNavigating ? (
                  <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <Search className="w-5 h-5 mr-2" />
                )}
                {isNavigating ? 'Loading...' : 'Discover Games'}
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            <div className="bg-white dark:bg-gray-800 rounded-xl p-4 mb-6 shadow-sm">
              <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4 items-center">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search your favorites..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>

                  {/* Sort */}
                  <Select
                    value={sortBy}
                    onValueChange={(value: SortOption) => setSortBy(value)}
                  >
                    <SelectTrigger className="w-48">
                      <SelectValue placeholder="Sort by..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="name_asc">Name A-Z</SelectItem>
                      <SelectItem value="name_desc">Name Z-A</SelectItem>
                      <SelectItem value="rating_high">Highest Rated</SelectItem>
                      <SelectItem value="rating_low">Lowest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="px-3 transition-all duration-200 hover:scale-105"
                    title="Grid View"
                  >
                    <Grid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="px-3 transition-all duration-200 hover:scale-105"
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Search Statistics */}
            {searchQuery && (
              <SearchStats
                totalResults={filteredAndSortedFavorites.length}
                currentPage={1}
                pageSize={filteredAndSortedFavorites.length}
                searchQuery={searchQuery}
              />
            )}

            {/* Results Info */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-gray-600 dark:text-gray-400">
                {filteredAndSortedFavorites.length === favorites.length
                  ? `${favorites.length} favorite${favorites.length !== 1 ? 's' : ''}`
                  : `${filteredAndSortedFavorites.length} of ${favorites.length} favorites`
                }
              </p>
              <div className="flex items-center gap-3">
                {currentCount >= 20 ? (
                  <Badge variant="destructive" className="animate-pulse">
                    Limit reached ({currentCount}/20)
                  </Badge>
                ) : currentCount >= 18 ? (
                  <Badge variant="destructive" className="animate-pulse">
                    Almost at limit ({currentCount}/20)
                  </Badge>
                ) : null}
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="transition-all duration-300 hover:scale-105 hover:shadow-md"
                  onClick={handleDiscoverMore}
                  disabled={isNavigating}
                >
                  {isNavigating ? (
                    <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Search className="w-4 h-4 mr-2" />
                  )}
                  {isNavigating ? 'Loading...' : 'Discover More'}
                </Button>
              </div>
            </div>

            {/* Limit Warning - Moved above games */}
            {currentCount >= 20 && (
              <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Heart className="w-5 h-5 text-yellow-600" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      Favorites limit reached
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                      You've saved the maximum of 20 games. Remove some favorites to add new ones.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Favorites Grid/List */}
            {filteredAndSortedFavorites.length === 0 && searchQuery ? (
              <NoSearchResults 
                searchQuery={searchQuery}
                onClearSearch={() => setSearchQuery('')}
                suggestions={[
                  'Try searching for a different game name',
                  'Check your spelling',
                  'Try searching by genre like "Action" or "RPG"',
                  'Clear the search to see all your favorites'
                ]}
              />
            ) : filteredAndSortedFavorites.length === 0 ? (
              <div className="text-center py-16">
                <Heart className="w-16 h-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  No favorites yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
                  Start exploring games and add them to your favorites by clicking the heart icon!
                </p>
                <Button 
                  variant="default" 
                  size="lg"
                  onClick={handleDiscoverMore}
                  disabled={isNavigating}
                  className="transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  {isNavigating ? (
                    <div className="w-5 h-5 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  ) : (
                    <Search className="w-5 h-5 mr-2" />
                  )}
                  {isNavigating ? 'Loading...' : 'Discover Games'}
                </Button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredAndSortedFavorites.map((favorite) => (
                  <div key={favorite.id} className="group bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden hover:-translate-y-1 border border-gray-100 dark:border-gray-700">
                    <div className="relative w-full h-48 overflow-hidden bg-gray-100 dark:bg-gray-700">
                      {favorite.gameImage && (
                        <OptimizedImage
                          src={favorite.gameImage}
                          alt={favorite.gameName}
                          fill
                          sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover transition-all duration-500 group-hover:scale-105"
                        />
                      )}
                      
                      {/* Enhanced Metacritic Score Badge */}
                      {favorite.gameRating && (
                        <div className="absolute top-3 right-3 z-10">
                          <div className="flex items-center gap-1.5 bg-black/90 backdrop-blur-sm text-white px-3 py-2 rounded-full shadow-lg border border-white/20">
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                            <span className="text-sm font-bold text-green-400">{(parseFloat(favorite.gameRating) * 20).toFixed(0)}</span>
                            <span className="text-xs text-gray-300 font-medium">MC</span>
                          </div>
                        </div>
                      )}

                      {/* Favorite Button - Remove functionality */}
                      <div className="absolute top-3 left-3 z-10">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleRemoveFavorite(favorite.gameId, favorite.gameName)}
                          disabled={isRemoving === favorite.gameId}
                          className="w-10 h-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-red-50 dark:hover:bg-red-900/20 rounded-full shadow-lg text-red-600 hover:text-red-700 border border-red-200 dark:border-red-800"
                          title="Remove from favorites"
                        >
                          {isRemoving === favorite.gameId ? (
                            <div className="w-4 h-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>

                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      
                      {/* Added Date Badge */}
                      <div className="absolute bottom-3 left-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
                        <div className="bg-white/90 dark:bg-gray-800/90 text-gray-900 dark:text-white px-2 py-1 rounded-md text-xs font-medium backdrop-blur-sm shadow-lg">
                          <Calendar className="w-3 h-3 mr-1 inline" />
                          {new Date(favorite.addedAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>

                    {/* Game Info */}
                    <div className="p-6 space-y-4">
                      {/* Title with Search Highlighting */}
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-200">
                        <SearchHighlight 
                          text={favorite.gameName}
                          query={searchQuery || ''}
                        />
                      </h3>
                      
                      {/* Rating */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-4 h-4 ${i < Math.floor(parseFloat(favorite.gameRating || '0')) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                              />
                            ))}
                          </div>
                          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                            {parseFloat(favorite.gameRating || '0').toFixed(1)}
                          </span>
                        </div>
                      </div>

                      {/* Genres */}
                      <div className="flex flex-wrap gap-1.5">
                        {(favorite.gameGenres || '').split(', ').slice(0, 3).map((genre, index) => (
                          <span 
                            key={index} 
                            className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                          >
                            <SearchHighlight 
                              text={genre} 
                              query={searchQuery || ''}
                            />
                          </span>
                        ))}
                        {(favorite.gameGenres || '').split(', ').length > 3 && (
                          <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300">
                            +{(favorite.gameGenres || '').split(', ').length - 3}
                          </span>
                        )}
                      </div>

                      {/* Footer with Platform Icons */}
                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-700">
                        <div className="flex items-center space-x-2">
                          {(() => {
                            const platforms = parsePlatforms(favorite.gamePlatforms)
                            const displayPlatforms = platforms.length > 0 ? platforms : getDefaultPlatforms()
                            return displayPlatforms.slice(0, 4).map((platform) => {
                              const isClickable = PlatformUtils.isClickablePlatform(platform)
                              const hoverColors = PlatformUtils.getPlatformHoverColor(platform)
                              
                              const handlePlatformClick = (e: React.MouseEvent) => {
                                e.stopPropagation()
                                if (isClickable) {
                                  const gameData = {
                                    id: parseInt(favorite.gameId),
                                    name: favorite.gameName,
                                    background_image: favorite.gameImage || '',
                                    rating: parseFloat(favorite.gameRating || '0'),
                                    rating_top: 5,
                                    ratings_count: 0,
                                    metacritic: 0,
                                    released: '',
                                    genres: [],
                                    platforms: []
                                  }
                                  const storeUrl = PlatformUtils.getStoreUrl(gameData, platform)
                                  if (storeUrl) {
                                    window.open(storeUrl, '_blank', 'noopener,noreferrer')
                                  }
                                }
                              }
                              
                              return (
                                <div
                                  key={platform.platform.id}
                                  onClick={handlePlatformClick}
                                  className={cn(
                                    "platform-container touch-target p-1.5 sm:p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 transition-all duration-200 border border-transparent",
                                    isClickable ? `cursor-pointer ${hoverColors}` : "cursor-default hover:bg-gray-200 dark:hover:bg-gray-600"
                                  )}
                                  title={isClickable ? `Open in ${PlatformUtils.getStoreName(platform)}` : platform.platform.name}
                                >
                                  <PlatformIcon platform={platform.platform.name} className="platform-icon w-4 h-4 sm:w-5 sm:h-5" />
                                </div>
                              )
                            })
                          })()}
                          {(() => {
                            const platforms = parsePlatforms(favorite.gamePlatforms)
                            const displayPlatforms = platforms.length > 0 ? platforms : getDefaultPlatforms()
                            return displayPlatforms.length > 4 && (
                              <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                +{displayPlatforms.length - 4}
                              </span>
                            )
                          })()}
                        </div>
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="w-3 h-3 mr-1" />
                          {new Date(favorite.addedAt).toLocaleDateString('en-US', { 
                            year: 'numeric', 
                            month: 'short', 
                            day: 'numeric' 
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              // List View - Matching main page design
              <div className="space-y-4">
                {filteredAndSortedFavorites.map((favorite) => (
                  <div key={favorite.id} className="group flex gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm hover:shadow-lg transition-all duration-300 border border-gray-100 dark:border-gray-700 hover:-translate-y-0.5 cursor-pointer">
                    {/* Game Image */}
                    <div className="relative w-24 h-24 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-700">
                      {favorite.gameImage && (
                        <OptimizedImage
                          src={favorite.gameImage}
                          alt={favorite.gameName}
                          fill
                          sizes="96px"
                          className="object-cover transition-all duration-500 group-hover:scale-105"
                        />
                      )}
                      
                      {/* Remove Button Overlay */}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleRemoveFavorite(favorite.gameId, favorite.gameName)
                          }}
                          disabled={isRemoving === favorite.gameId}
                          className="w-8 h-8 bg-white/90 hover:bg-red-50 rounded-full text-red-600 hover:text-red-700 p-0"
                          title="Remove from favorites"
                        >
                          {isRemoving === favorite.gameId ? (
                            <div className="w-3 h-3 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">
                            <SearchHighlight 
                              text={favorite.gameName}
                              query={searchQuery || ''}
                            />
                          </h3>
                          
                          {/* Rating and Metacritic */}
                          <div className="flex items-center gap-4 mt-1">
                            <div className="flex items-center gap-1">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star 
                                  key={i} 
                                  className={`w-4 h-4 ${i < Math.floor(parseFloat(favorite.gameRating || '0')) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`} 
                                />
                              ))}
                              <span className="text-sm text-gray-600 dark:text-gray-400 ml-1">
                                {parseFloat(favorite.gameRating || '0').toFixed(1)}
                              </span>
                            </div>
                            {favorite.gameRating && (
                              <div className="flex items-center gap-1 text-sm">
                                <span className="text-gray-600 dark:text-gray-400">MC:</span>
                                <span className="font-semibold text-green-400">
                                  {(parseFloat(favorite.gameRating) * 20).toFixed(0)}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* Genres and Platform */}
                          <div className="flex items-center justify-between mt-3">
                            <div className="flex flex-wrap gap-1">
                              {favorite.gameGenres && favorite.gameGenres.split(', ').slice(0, 3).map((genre, index) => (
                                <span
                                  key={index}
                                  className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                >
                                  <SearchHighlight 
                                    text={genre} 
                                    query={searchQuery || ''}
                                  />
                                </span>
                              ))}
                            </div>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1">
                                {(() => {
                                  const platforms = parsePlatforms(favorite.gamePlatforms)
                                  const displayPlatforms = platforms.length > 0 ? platforms : getDefaultPlatforms()
                                  return displayPlatforms.slice(0, 3).map((platform) => {
                                    const isClickable = PlatformUtils.isClickablePlatform(platform)
                                    const hoverColors = PlatformUtils.getPlatformHoverColor(platform)
                                    
                                    const handlePlatformClick = (e: React.MouseEvent) => {
                                      e.stopPropagation()
                                      if (isClickable) {
                                        const gameData = {
                                          id: parseInt(favorite.gameId),
                                          name: favorite.gameName,
                                          background_image: favorite.gameImage || '',
                                          rating: parseFloat(favorite.gameRating || '0'),
                                          rating_top: 5,
                                          ratings_count: 0,
                                          metacritic: 0,
                                          released: '',
                                          genres: [],
                                          platforms: []
                                        }
                                        const storeUrl = PlatformUtils.getStoreUrl(gameData, platform)
                                        if (storeUrl) {
                                          window.open(storeUrl, '_blank', 'noopener,noreferrer')
                                        }
                                      }
                                    }
                                    
                                    return (
                                      <div
                                        key={platform.platform.id}
                                        onClick={handlePlatformClick}
                                        className={cn(
                                          "platform-container touch-target p-1 sm:p-1.5 rounded border border-transparent transition-all duration-200",
                                          isClickable ? `cursor-pointer ${hoverColors}` : "cursor-default"
                                        )}
                                        title={isClickable ? `Open in ${PlatformUtils.getStoreName(platform)}` : platform.platform.name}
                                      >
                                        <PlatformIcon
                                          platform={platform.platform.name}
                                          className="platform-icon w-4 h-4 sm:w-5 sm:h-5 text-gray-600 dark:text-gray-400"
                                        />
                                      </div>
                                    )
                                  })
                                })()}
                                {(() => {
                                  const platforms = parsePlatforms(favorite.gamePlatforms)
                                  const displayPlatforms = platforms.length > 0 ? platforms : getDefaultPlatforms()
                                  return displayPlatforms.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
                                      +{displayPlatforms.length - 3}
                                    </span>
                                  )
                                })()}
                              </div>
                              <span className="text-xs text-gray-500 dark:text-gray-400">
                                {new Date(favorite.addedAt).toLocaleDateString('en-US', { 
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric' 
                                })}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
