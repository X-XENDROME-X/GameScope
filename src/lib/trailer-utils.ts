import { Game } from '@/types/game'

/**
 * Advanced YouTube trailer search utilities
 * Redesigned for maximum accuracy and real-world effectiveness
 */
export class AdvancedTrailerUtils {
  /**
   * Builds optimized YouTube search query for finding game trailers
   * Strategy: Start simple, then add refinement only when necessary
   */
  static buildOptimizedQuery(game: Game): string {
    const gameName = game.name
    const releaseYear = new Date(game.released).getFullYear()
    
    // Step 1: Clean the game name (remove problematic parts)
    const cleanName = gameName
      // Remove edition suffixes that hurt search
      .replace(/\s*:\s*(Game of the Year|GOTY|Definitive|Enhanced|Complete|Ultimate|Deluxe|Premium|Gold|Platinum|Director's Cut|Remastered|HD|4K).*$/gi, '')
      // Remove trailing version numbers (e.g., "FIFA 24" -> "FIFA 24" is fine, but "Game 2" -> "Game")
      .replace(/\s+\d{4}$/, match => {
        // Keep year if it's likely a sports game or sequel year
        const year = parseInt(match.trim())
        if (year >= 2000 && year <= new Date().getFullYear() + 2) {
          return match // Keep it
        }
        return '' // Remove it
      })
      // Clean up extra spaces
      .replace(/\s+/g, ' ')
      .trim()

    // Step 2: Build the base query
    // Strategy: Use exact game name + trailer, that's it!
    let query = `"${cleanName}" trailer`
    
    // Step 3: Add year ONLY if the game is newer (helps with disambiguation)
    // For older games, year often hurts more than helps
    if (releaseYear >= 2015) {
      query += ` ${releaseYear}`
    }
    
    // Step 4: NO negative terms - they often filter out the right video
    // YouTube's algorithm is smart enough to prioritize official content
    
    return query
  }

  /**
   * Alternative: Even simpler approach for tough cases
   */
  static buildSimpleQuery(game: Game): string {
    const gameName = game.name
      // Only remove the most problematic suffixes
      .replace(/\s*:\s*(Game of the Year|GOTY|Definitive Edition|Complete Edition).*$/gi, '')
      .trim()
    
    // Just game name + trailer - sometimes simple is better
    return `${gameName} trailer`
  }

  /**
   * Builds a more specific query for recent AAA games
   */
  static buildAAQuery(game: Game): string {
    const gameName = game.name
    const releaseYear = new Date(game.released).getFullYear()
    const isRecentGame = releaseYear >= 2020
    
    if (isRecentGame && this.isLikelyAAGame(game)) {
      // For recent AAA games, we can be more specific
      return `"${gameName}" official trailer ${releaseYear}`
    }
    
    // Fallback to simple approach
    return this.buildSimpleQuery(game)
  }

  /**
   * Checks if game is likely AAA (has good indicators for official trailers)
   */
  private static isLikelyAAGame(game: Game): boolean {
    // High rating, recent release, and well-known publishers
    const hasHighRating = (game.rating || 0) > 4.0
    const hasMetacritic = (game.metacritic || 0) > 70
    const hasGoodPublisher = Boolean(game.publishers?.some(pub => 
      ['ubisoft', 'ea', 'activision', 'sony', 'microsoft', 'nintendo', 
       'bethesda', 'rockstar', 'valve', 'epic games', '2k games',
       'square enix', 'capcom', 'bandai namco', 'cd projekt'].some(known =>
        pub.name.toLowerCase().includes(known.toLowerCase())
      )
    ))
    
    return hasHighRating && (hasMetacritic || hasGoodPublisher)
  }

  /**
   * Generates YouTube search URL with the best query strategy
   */
  static getTrailerSearchUrl(game: Game): string {
    // Try the optimized query first
    const query = this.buildOptimizedQuery(game)
    const encodedQuery = encodeURIComponent(query)
    
    // Use YouTube's search with video filter only (no other restrictions)
    return `https://www.youtube.com/results?search_query=${encodedQuery}&sp=EgIQAQ%253D%253D`
  }

  /**
   * Get the best trailer URL using smart query selection
   */
  static getOfficialTrailerUrl(game: Game): string {
    const releaseYear = new Date(game.released).getFullYear()
    
    // Strategy selection based on game characteristics
    let query: string
    
    if (releaseYear >= 2020 && this.isLikelyAAGame(game)) {
      // Recent AAA game - can be more specific
      query = this.buildAAQuery(game)
    } else if (releaseYear < 2010) {
      // Older game - keep it very simple
      query = this.buildSimpleQuery(game)
    } else {
      // Standard approach
      query = this.buildOptimizedQuery(game)
    }
    
    const encodedQuery = encodeURIComponent(query)
    return `https://www.youtube.com/results?search_query=${encodedQuery}&sp=EgIQAQ%253D%253D`
  }

  /**
   * Backup search if primary doesn't work
   */
  static getFallbackTrailerUrl(game: Game): string {
    const simpleQuery = `${game.name} gameplay trailer`
    const encodedQuery = encodeURIComponent(simpleQuery)
    return `https://www.youtube.com/results?search_query=${encodedQuery}&sp=EgIQAQ%253D%253D`
  }
}

/**
 * Simple function for backward compatibility
 */
export function getYouTubeTrailerUrl(game: Game): string {
  return AdvancedTrailerUtils.getOfficialTrailerUrl(game)
}
