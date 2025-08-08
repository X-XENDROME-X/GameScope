'use client'

import { useState, useEffect } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Header } from '@/components/layout/header'
import { GameGrid } from '@/components/game/game-grid'
import { GameList } from '@/components/game/game-list'
import { GameDetailModal } from '@/components/game/game-detail-modal'
import { SearchStats, NoSearchResults } from '@/components/game/search-enhancements'
import { FavoritesNotification } from '@/components/ui/favorites-notification'
import { gameAPI } from '@/lib/api'
import { Game, GameSearchParams } from '@/types/game'
import { Grid3X3, List } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useNavigation } from '@/contexts/navigation-context'
import { useFavorites } from '@/hooks/use-favorites'
import { useSession } from 'next-auth/react'
import Script from 'next/script'

interface Filters {
  platforms?: string
  genres?: string
  ordering?: string
}

export default function Home() {
  const { setPageLoaded } = useNavigation()
  const { data: session } = useSession()
  const { getRealTimeCount } = useFavorites()
  const currentFavoritesCount = getRealTimeCount()
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<Filters>({})
  const [selectedGame, setSelectedGame] = useState<Game | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [currentPage, setCurrentPage] = useState(1)
  const [allGames, setAllGames] = useState<Game[]>([])
  const [resetKey, setResetKey] = useState(0) // Add a reset key
  const [searchStartTime, setSearchStartTime] = useState<number | null>(null)
  const [searchTime, setSearchTime] = useState<number | null>(null)
  const [showFavoritesNotification, setShowFavoritesNotification] = useState(false)
  const [lastFavoritesCount, setLastFavoritesCount] = useState(0)
  const [isNewSearch, setIsNewSearch] = useState(false)

  // Signal that the page has loaded
  useEffect(() => {
    setPageLoaded()
  }, [setPageLoaded])

  // Handle favorites notification logic
  useEffect(() => {
    if (!session?.user) {
      setShowFavoritesNotification(false)
      setLastFavoritesCount(0)
      return
    }

    // Show notification when count changes and meets certain conditions
    if (currentFavoritesCount !== lastFavoritesCount) {
      // Show notification when reaching 18+ favorites or when at limit
      if (currentFavoritesCount >= 18) {
        setShowFavoritesNotification(true)
      } else if (currentFavoritesCount < 18 && lastFavoritesCount >= 18) {
        // Hide notification when dropping below 18
        setShowFavoritesNotification(false)
      }
      
      setLastFavoritesCount(currentFavoritesCount)
    }
  }, [currentFavoritesCount, lastFavoritesCount, session?.user])

  const { data: gamesData, isLoading, error, isFetching } = useQuery({
    queryKey: ['games', searchQuery || null, filters, currentPage, resetKey],
    queryFn: async () => {
      // Track search performance
      const startTime = Date.now()
      setSearchStartTime(startTime)
      
      const apiParams: GameSearchParams = {
        page_size: 6,
        page: currentPage,
      }

      // Add search query if provided and not empty
      if (searchQuery && searchQuery.trim() !== '') {
        apiParams.search = searchQuery.trim()
      }

      // Add genre filter if not 'all'
      if (filters.genres && filters.genres !== 'all') {
        apiParams.genres = filters.genres
      }

      // Add platform filter if not 'all'
      if (filters.platforms && filters.platforms !== 'all') {
        apiParams.platforms = filters.platforms
      }

      // Add ordering/sorting
      if (filters.ordering) {
        apiParams.ordering = filters.ordering
      } else {
        apiParams.ordering = '-added' // Default to most popular/added games
      }

      try {
        const result = await gameAPI.getGames(apiParams)
        
        // Calculate search time
        if (searchStartTime) {
          const endTime = Date.now()
          setSearchTime((endTime - searchStartTime) / 1000)
        }
        
        return result
      } catch (error) {
        // Reset search time on error
        setSearchTime(null)
        throw error
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: true, // Always enabled
  })

  // Handle pagination by accumulating games
  useEffect(() => {
    if (gamesData?.results) {
      if (currentPage === 1) {
        // First page or new search/filter - replace all games
        setAllGames(gamesData.results as Game[])
      } else {
        // Subsequent pages - append to existing games
        setAllGames(prev => [...prev, ...gamesData.results] as Game[])
      }
    }
  }, [gamesData, currentPage])

  // Reset pagination when search or filters change
  useEffect(() => {
    setCurrentPage(1)
    setAllGames([])
    setSearchTime(null) // Reset search time when new search starts
    setIsNewSearch(true) // Mark as new search for better loading UX
  }, [searchQuery, filters])

  // Reset new search flag when data is loaded
  useEffect(() => {
    if (gamesData && !isLoading) {
      setIsNewSearch(false)
    }
  }, [gamesData, isLoading])

  // Force fresh data when search is cleared
  useEffect(() => {
    if (searchQuery === '') {
      setResetKey(prev => prev + 1)
    }
  }, [searchQuery])

  const games = allGames
  const gameCount = gamesData?.count || 0
  const hasMoreGames = gameCount > allGames.length

  const handleLoadMore = () => {
    if (hasMoreGames && !isFetching) {
      setCurrentPage(prev => prev + 1)
    }
  }

  const handleSearch = (query: string) => {
    const trimmedQuery = query.trim()
    setSearchQuery(trimmedQuery)
    setSearchTime(null) // Reset search time for new search
  }

  const handleClearSearch = () => {
    setSearchQuery('')
    setSearchTime(null)
  }

  const handleFilterChange = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const handleGameClick = (game: Game) => {
    setSelectedGame(game)
  }

  const handleCloseModal = () => {
    setSelectedGame(null)
  }

  return (
    <>
      {/* Breadcrumbs & WebSite JSON-LD */}
      <Script id="jsonld-website" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'GameScope',
          url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
          potentialAction: {
            '@type': 'SearchAction',
            target: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/?q={search_term_string}`,
            'query-input': 'required name=search_term_string',
          },
        })}
      </Script>
      <Script id="jsonld-breadcrumbs" type="application/ld+json">
        {JSON.stringify({
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Home',
              item: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
            },
          ],
        })}
      </Script>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header 
        onSearch={handleSearch} 
        onFilterChange={handleFilterChange}
      />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
        {/* Enhanced Search Statistics */}
        {searchQuery && (
          <SearchStats
            totalResults={gameCount}
            currentPage={currentPage}
            pageSize={6}
            searchQuery={searchQuery}
            searchTime={searchTime || undefined}
          />
        )}

        {/* Favorites Notification */}
        {session && (
          <FavoritesNotification
            count={currentFavoritesCount}
            isVisible={showFavoritesNotification}
            onDismiss={() => setShowFavoritesNotification(false)}
            showDismiss={currentFavoritesCount < 20}
          />
        )}

        {/* Results Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
                {searchQuery ? (
                  (isLoading || isNewSearch || (isFetching && games.length === 0)) ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-600 border-t-transparent"></div>
                      Searching...
                    </>
                  ) : gameCount > 0 ? `Search Results` : 'No Results Found'
                ) : (
                  'Discover Games'
                )}
              </h2>
              {!searchQuery && gameCount > games.length && !isLoading && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Showing {games.length} of {gameCount.toLocaleString()} total games
                </p>
              )}
            </div>
          </div>

          {/* Fixed View Controls */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 shadow-sm border border-gray-200 dark:border-gray-700">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                title="Grid View"
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8 w-8 p-0 transition-all duration-200 hover:scale-105"
                title="List View"
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">⚠️</div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Something went wrong
            </h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
              We couldn't load the games. Please try again later.
            </p>
          </div>
        )}

        {/* No Search Results State */}
        {!error && !isLoading && searchQuery && games.length === 0 && (
          <NoSearchResults 
            searchQuery={searchQuery}
            onClearSearch={handleClearSearch}
            suggestions={[
              'Try searching for popular games like "Cyberpunk 2077", "The Witcher", or "Grand Theft Auto"',
              'Use shorter, more general terms like "RPG", "Action", or "Adventure"',
              'Check your spelling and try different variations',
              'Browse by genre or platform using the filters above'
            ]}
          />
        )}

        {/* Dynamic Game Display based on viewMode */}
        {!error && (isLoading || isFetching || isNewSearch || games.length > 0) && (
          <>
            {viewMode === 'grid' ? (
              <GameGrid
                games={games}
                loading={isLoading || isNewSearch || (isFetching && games.length === 0)}
                onGameClick={handleGameClick}
                searchQuery={searchQuery}
              />
            ) : (
              <GameList
                games={games}
                loading={isLoading || isNewSearch || (isFetching && games.length === 0)}
                onGameClick={handleGameClick}
                searchQuery={searchQuery}
              />
            )}
          </>
        )}

        {/* Load More Button with Pagination */}
        {games.length > 0 && hasMoreGames && (
          <div className="text-center mt-12">
            <Button 
              variant="outline" 
              size="lg" 
              onClick={handleLoadMore}
              disabled={isFetching}
              className="min-w-[200px] bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400 dark:hover:border-gray-500 transition-all duration-200"
            >
              {isFetching ? 'Loading...' : 'Load More Games'}
            </Button>
          </div>
        )}
      </main>

      {/* Game Detail Modal */}
      <GameDetailModal
        game={selectedGame}
        isOpen={!!selectedGame}
        onClose={handleCloseModal}
      />
    </div>
    </>
  )
}
