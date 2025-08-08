'use client'

import { Game } from '@/types/game'
import { GameCard } from './game-card'
import { GameCardSkeleton } from './game-card-skeleton'

interface GameGridProps {
  games: Game[]
  loading?: boolean
  onGameClick?: (game: Game) => void
  searchQuery?: string
}

export function GameGrid({ games, loading, onGameClick, searchQuery }: GameGridProps) {
  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
        {Array.from({ length: 6 }).map((_, index) => (
          <GameCardSkeleton key={index} />
        ))}
      </div>
    )
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12 sm:py-16 md:py-20">
        <div className="text-6xl sm:text-7xl md:text-8xl mb-4 sm:mb-6 opacity-50">🎮</div>
        <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 dark:text-white mb-2 sm:mb-3 px-4">
          No games found
        </h3>
        <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 max-w-md mx-auto px-4 leading-relaxed">
          Try adjusting your search criteria or browse all games to discover something new.
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-4 sm:gap-6 md:gap-6 lg:gap-8">
      {games.map((game) => (
        <GameCard 
          key={game.id} 
          game={game} 
          onClick={onGameClick}
          searchQuery={searchQuery}
        />
      ))}
    </div>
  )
}
