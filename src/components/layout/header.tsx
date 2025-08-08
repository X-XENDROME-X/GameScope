'use client'

import { useEffect } from 'react'
import { Search, Heart, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { NavigableLogo } from '@/components/ui/navigable-logo'
import { SmoothLink } from '@/components/ui/smooth-link'
import { useGameSearch } from '@/hooks/use-debounced-search'
import { AuthButton } from '@/components/auth/auth-button'

interface HeaderProps {
  onSearch?: (query: string) => void
  onFilterChange?: (filters: { platforms?: string; genres?: string; ordering?: string }) => void
}

export function Header({ onSearch, onFilterChange }: HeaderProps) {
  const { 
    debouncedValue, 
    isSearching, 
    immediateValue, 
    setImmediateValue, 
    clearSearch 
  } = useGameSearch()

  // Call the parent's onSearch when debounced value changes
  useEffect(() => {
    onSearch?.(debouncedValue)
  }, [debouncedValue, onSearch])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setImmediateValue(e.target.value)
  }

  const handleClearSearch = () => {
    clearSearch()
  }

  return (
    <header className="relative">
      {/* Navigation Bar */}
      <nav className="border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-900/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Animated Logo in Header */}
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <NavigableLogo 
                  variant="transparent" 
                  size="md" 
                  animated={true}
                  href="/"
                />
              </div>
            </div>

            {/* Right side - Enhanced navigation items */}
            <div className="flex items-center space-x-2">
              <SmoothLink href="/favorites">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 px-4 py-2 rounded-xl transition-all duration-200 ease-out hover:scale-105 active:scale-95 font-medium group"
                >
                  <Heart className="w-5 h-5 mr-2 transition-all duration-300 group-hover:fill-red-500 group-hover:text-red-500 dark:group-hover:fill-red-400 dark:group-hover:text-red-400" />
                  <span className="hidden sm:inline">Favorites</span>
                </Button>
              </SmoothLink>
              <AuthButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Enhanced Hero Section - Mobile Optimized */}
      <div className="relative bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 py-12 sm:py-16 lg:py-24 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            {/* Mobile-Optimized heading with cleaned up decorative elements */}
            <div className="relative star-container">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-gray-900 dark:text-white leading-tight">
                <span className="relative inline-block">
                  <span className="absolute -left-6 sm:-left-8 md:-left-12 lg:-left-16 top-0 text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-60 animate-pulse">
                    ✨
                  </span>
                  Discover Your Next
                  <span className="absolute -right-6 sm:-right-8 md:-right-12 lg:-right-16 top-0 text-xl sm:text-2xl md:text-3xl lg:text-4xl opacity-60 animate-pulse">
                    ✨
                  </span>
                </span>
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-gradient block">
                  Favorite Game
                </span>
                {/* Inline controller with better spacing */}
                <span className="inline-block ml-2 text-2xl sm:text-3xl md:text-4xl opacity-50 animate-bounce">
                  🎮
                </span>
              </h1>
              
              {/* Enhanced decorative elements with symmetry */}
              <div className="absolute -top-3 sm:-top-4 md:-top-6 left-1/4 text-base sm:text-lg md:text-xl opacity-30 animate-float star-decoration">⭐</div>
              <div className="absolute -top-3 sm:-top-4 md:-top-6 right-1/4 text-base sm:text-lg md:text-xl opacity-30 animate-float delay-1000 star-decoration">⭐</div>
            </div>
            
            <p className="mt-6 sm:mt-8 text-base sm:text-lg leading-7 sm:leading-8 text-gray-600 dark:text-gray-400 max-w-2xl mx-auto px-4">
              Explore thousands of games, read reviews, and find your perfect match across all platforms. 
              Your gaming journey starts here.
            </p>
            
            {/* Updated Gaming stats with accurate API numbers */}
            <div className="mt-6 sm:mt-8 grid grid-cols-3 gap-3 sm:gap-4 max-w-sm sm:max-w-lg mx-auto px-4">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">800K+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Games</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">2M+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Reviews</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">15K+</div>
                <div className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">Developers</div>
              </div>
            </div>
            
            {/* Mobile-Optimized Search Section */}
            <div className="mt-6 sm:mt-8 md:mt-10 lg:mt-12 max-w-4xl mx-auto px-4">
              <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Enhanced Search Input with Loading State */}
                <div className="relative md:col-span-2 lg:col-span-1">
                  <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 transition-colors ${
                    isSearching ? 'text-blue-500 animate-pulse' : 'text-gray-400'
                  }`} />
                  <Input
                    type="text"
                    placeholder="Search games..."
                    value={immediateValue}
                    onChange={handleSearchChange}
                    className="mobile-dropdown pl-9 sm:pl-10 pr-10 h-11 sm:h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 focus:border-blue-500 dark:focus:border-blue-400 rounded-xl text-base touch-target"
                  />
                  {/* Clear Search Button */}
                  {immediateValue && (
                    <button
                      onClick={handleClearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      aria-label="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  {/* Search Status Indicator */}
                  {isSearching && (
                    <div className="absolute top-full left-0 mt-1 text-xs text-blue-600 dark:text-blue-400">
                      Searching...
                    </div>
                  )}
                </div>

                {/* Filter Dropdowns - RAWG API Compatible */}
                <Select onValueChange={(value) => onFilterChange?.({ platforms: value })}>
                  <SelectTrigger className="dropdown-trigger mobile-dropdown h-11 sm:h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl text-base touch-target">
                    <SelectValue placeholder="All Platforms" />
                  </SelectTrigger>
                  <SelectContent 
                    side="bottom" 
                    align="start" 
                    className="max-h-[200px] overflow-y-auto dropdown-ipad"
                    avoidCollisions={false}
                    collisionPadding={0}
                  >
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="4">PC</SelectItem>
                    <SelectItem value="187">PlayStation 5</SelectItem>
                    <SelectItem value="18">PlayStation 4</SelectItem>
                    <SelectItem value="1">Xbox One</SelectItem>
                    <SelectItem value="186">Xbox Series S/X</SelectItem>
                    <SelectItem value="7">Nintendo Switch</SelectItem>
                    <SelectItem value="3">iOS</SelectItem>
                    <SelectItem value="21">Android</SelectItem>
                    <SelectItem value="5">macOS</SelectItem>
                    <SelectItem value="6">Linux</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => onFilterChange?.({ genres: value })}>
                  <SelectTrigger className="dropdown-trigger mobile-dropdown h-11 sm:h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl text-base touch-target">
                    <SelectValue placeholder="All Genres" />
                  </SelectTrigger>
                  <SelectContent 
                    side="bottom" 
                    align="start" 
                    className="max-h-[200px] overflow-y-auto dropdown-ipad"
                    avoidCollisions={false}
                    collisionPadding={0}
                  >
                    <SelectItem value="all">All Genres</SelectItem>
                    <SelectItem value="4">Action</SelectItem>
                    <SelectItem value="3">Adventure</SelectItem>
                    <SelectItem value="5">RPG</SelectItem>
                    <SelectItem value="10">Strategy</SelectItem>
                    <SelectItem value="14">Simulation</SelectItem>
                    <SelectItem value="15">Sports</SelectItem>
                    <SelectItem value="2">Shooter</SelectItem>
                    <SelectItem value="40">Casual</SelectItem>
                    <SelectItem value="19">Family</SelectItem>
                    <SelectItem value="6">Fighting</SelectItem>
                    <SelectItem value="7">Puzzle</SelectItem>
                    <SelectItem value="83">Platformer</SelectItem>
                    <SelectItem value="59">Massively Multiplayer</SelectItem>
                    <SelectItem value="1">Racing</SelectItem>
                    <SelectItem value="51">Indie</SelectItem>
                  </SelectContent>
                </Select>

                <Select onValueChange={(value) => onFilterChange?.({ ordering: value })}>
                  <SelectTrigger className="dropdown-trigger mobile-dropdown h-11 sm:h-12 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-gray-200 dark:border-gray-700 rounded-xl text-base touch-target">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent 
                    side="bottom" 
                    align="start" 
                    className="max-h-[200px] overflow-y-auto dropdown-ipad"
                    avoidCollisions={false}
                    collisionPadding={0}
                  >
                    <SelectItem value="-added">Popularity</SelectItem>
                    <SelectItem value="-rating">Highest Rated</SelectItem>
                    <SelectItem value="rating">Lowest Rated</SelectItem>
                    <SelectItem value="-released">Newest First</SelectItem>
                    <SelectItem value="released">Oldest First</SelectItem>
                    <SelectItem value="name">A-Z</SelectItem>
                    <SelectItem value="-name">Z-A</SelectItem>
                    <SelectItem value="-metacritic">Metacritic Score</SelectItem>
                    <SelectItem value="-created">Recently Added</SelectItem>
                    <SelectItem value="-updated">Recently Updated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
