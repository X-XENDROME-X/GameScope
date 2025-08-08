/**
 * Frontend API Client for Gaming Hub
 * Securely communicates with our backend API proxy layer
 * Protects sensitive API keys by using server-side endpoints
 */

// Types for better TypeScript support
interface Platform {
  platform: {
    id: number
    name: string
    slug: string
  }
}

interface Genre {
  id: number
  name: string
  slug: string
}

interface Tag {
  id: number
  name: string
  slug: string
  language: string
  games_count: number
  image_background: string
}

interface ESRBRating {
  id: number
  name: string
  slug: string
}

interface Screenshot {
  id: number
  image: string
}

interface Developer {
  id: number
  name: string
  slug: string
}

interface Publisher {
  id: number
  name: string
  slug: string
}

interface Store {
  id: number
  url: string
  store: {
    id: number
    name: string
    slug: string
  }
}

interface MetacriticPlatform {
  metascore: number
  url: string
  platform: {
    platform: number
    name: string
    slug: string
  }
}

interface Thumbnails {
  default: { url: string; width: number; height: number }
  medium: { url: string; width: number; height: number }
  high: { url: string; width: number; height: number }
}

interface Game {
  id: number
  slug: string
  name: string
  released: string
  background_image: string
  rating: number
  rating_top: number
  ratings_count: number
  metacritic: number | null
  playtime: number
  platforms: Platform[]
  genres: Genre[]
  tags: Tag[]
  esrb_rating: ESRBRating | null
  short_screenshots: Screenshot[]
  // Optional fields for compatibility with existing types
  description_raw?: string
  name_original?: string
  reviews_count?: number
  metacritic_url?: string
  website?: string
  reddit_url?: string
  reddit_name?: string
  reddit_description?: string
  reddit_logo?: string
  reddit_count?: number
  youtube_count?: number
  twitch_count?: number
  developers?: Developer[]
  publishers?: Publisher[]
  stores?: Store[]
  dominant_color?: string
  saturated_color?: string
  screenshots?: Screenshot[]
  trailers?: Array<{ id: number; name: string; preview: string; data: { [key: string]: string } }>
  clip?: {
    clip: string
    clips: { [key: string]: string }
  }
}

interface GameDetails extends Game {
  description: string
  description_raw: string
  website: string
  reddit_url: string
  reddit_name: string
  reddit_description: string
  metacritic_platforms: MetacriticPlatform[]
  developers: Developer[]
  publishers: Publisher[]
  stores: Store[]
  screenshots_count: number
  movies_count: number
}

interface ApiResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

interface YouTubeVideo {
  id: {
    videoId: string
  }
  snippet: {
    title: string
    description: string
    thumbnails: Thumbnails
    channelTitle: string
    publishedAt: string
  }
}

interface HealthStatus {
  status: string
  timestamp: string
  version: string
  environment: string
  services: {
    rawg: boolean
    youtube: boolean
  }
}

export class SecureGameAPI {
  private readonly baseUrl: string

  constructor() {
    // Use environment variable or fallback to current origin for deployment
    this.baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
                   (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000')
  }

  /**
   * Generic API call method with error handling and validation
   */
  private async apiCall<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}/api${endpoint}`
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ 
          error: 'API request failed', 
          code: 'HTTP_ERROR' 
        }))
        throw new Error(`${errorData.error} (${response.status})`)
      }

      return await response.json()
    } catch (error) {
      console.error(`API call failed for ${endpoint}:`, error)
      throw error
    }
  }

  /**
   * Build query parameters from an object
   */
  private buildQueryParams(params: Record<string, string | number | boolean>): string {
    const searchParams = new URLSearchParams()
    
    for (const [key, value] of Object.entries(params)) {
      if (value !== null && value !== undefined && value !== '') {
        searchParams.set(key, value.toString())
      }
    }
    
    return searchParams.toString()
  }

  // ==============================
  // GAME SEARCH & DISCOVERY
  // ==============================

  /**
   * Search for games with filters
   */
  async getGames(params: {
    search?: string
    genres?: string
    platforms?: string
    dates?: string
    ordering?: string
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<Game>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall<ApiResponse<Game>>(`/games/search?${queryString}`)
  }

  /**
   * Get trending games
   */
  async getTrendingGames(params: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<Game>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall<ApiResponse<Game>>(`/games/trending?${queryString}`)
  }

  /**
   * Get detailed information about a specific game
   */
  async getGameDetails(gameId: number | string): Promise<GameDetails> {
    return this.apiCall<GameDetails>(`/games/${gameId}`)
  }

  /**
   * Get screenshots for a specific game
   */
  async getGameScreenshots(gameId: number | string, params: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<{ id: number; image: string; width: number; height: number }>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall(`/games/${gameId}/screenshots?${queryString}`)
  }

  // ==============================
  // GENRES & PLATFORMS
  // ==============================

  /**
   * Get all gaming genres
   */
  async getGenres(params: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<{
    id: number
    name: string
    slug: string
    games_count: number
    image_background: string
    games: Array<{ id: number; name: string; slug: string; added: number }>
  }>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall(`/genres?${queryString}`)
  }

  /**
   * Get all gaming platforms
   */
  async getPlatforms(params: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<{
    id: number
    name: string
    slug: string
    games_count: number
    image_background: string
    year_start: number | null
    year_end: number | null
    games: Array<{ id: number; name: string; slug: string; added: number }>
  }>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall(`/platforms?${queryString}`)
  }

  // ==============================
  // MULTIMEDIA CONTENT
  // ==============================

  /**
   * Get YouTube trailers for a game
   */
  async getGameTrailers(gameName: string, params: {
    max_results?: number
  } = {}): Promise<{ items: YouTubeVideo[] }> {
    const queryParams = {
      game: gameName,
      ...params
    }
    const queryString = this.buildQueryParams(queryParams)
    return this.apiCall<{ items: YouTubeVideo[] }>(`/youtube/trailer?${queryString}`)
  }

  // ==============================
  // BACKWARD COMPATIBILITY METHODS
  // ==============================

  /**
   * Legacy method - get game details (for backward compatibility)
   */
  async getGame(gameId: number | string): Promise<GameDetails> {
    return this.getGameDetails(gameId)
  }

  /**
   * Legacy method - get game reviews
   */
  async getGameReviews(gameId: number | string, params: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<{
    id: number
    text: string
    rating: number
    user: {
      id: number
      username: string
      avatar?: string
    } | null
    created: string
    updated: string
  }>> {
    const queryString = this.buildQueryParams(params)
    return this.apiCall(`/games/${gameId}/reviews?${queryString}`)
  }

  // ==============================
  // SYSTEM HEALTH & STATUS
  // ==============================

  /**
   * Check API health status
   */
  async getHealthStatus(): Promise<HealthStatus> {
    return this.apiCall<HealthStatus>('/health')
  }

  // ==============================
  // CONVENIENCE METHODS
  // ==============================

  /**
   * Search for games by name (convenience method)
   */
  async searchGames(query: string, options: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<Game>> {
    return this.getGames({
      search: query,
      ...options
    })
  }

  /**
   * Get popular games (convenience method)
   */
  async getPopularGames(options: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<Game>> {
    return this.getGames({
      ordering: '-rating',
      ...options
    })
  }

  /**
   * Get recent games (convenience method)
   */
  async getRecentGames(options: {
    page?: number
    page_size?: number
  } = {}): Promise<ApiResponse<Game>> {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    
    return this.getGames({
      dates: `${thirtyDaysAgo.toISOString().split('T')[0]},${new Date().toISOString().split('T')[0]}`,
      ordering: '-released',
      ...options
    })
  }
}

// Export singleton instance
export const gameAPI = new SecureGameAPI()

// Backward compatibility - alias for old frontend code
export const rawgApi = gameAPI

// Export types for external use
export type {
  Game,
  GameDetails,
  ApiResponse,
  YouTubeVideo,
  HealthStatus
}
