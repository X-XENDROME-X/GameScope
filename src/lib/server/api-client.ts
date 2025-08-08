// Server-side API client - Never expose API keys!

export class SecureAPIClient {
  private static instance: SecureAPIClient
  private rawgApiKey: string
  private youtubeApiKey: string

  private constructor() {
    this.rawgApiKey = process.env.RAWG_API_KEY || ''
    this.youtubeApiKey = process.env.YOUTUBE_API_KEY || ''
    
    if (!this.rawgApiKey) {
      throw new Error('RAWG_API_KEY environment variable is required')
    }
  }

  public static getInstance(): SecureAPIClient {
    if (!SecureAPIClient.instance) {
      SecureAPIClient.instance = new SecureAPIClient()
    }
    return SecureAPIClient.instance
  }

  async fetchRAWG(endpoint: string, params: Record<string, string | number | boolean> = {}): Promise<unknown> {
    const url = new URL(`https://api.rawg.io/api/${endpoint}`)
    
    // Add API key
    url.searchParams.set('key', this.rawgApiKey)
    
    // Add other parameters
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        url.searchParams.set(key, value.toString())
      }
    })

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': 'GameScope-Hub/1.0',
          'Accept': 'application/json',
        },
        // Add cache for better performance
        next: { revalidate: 300 } // 5 minutes cache
      })

      if (!response.ok) {
        throw new Error(`RAWG API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('RAWG API fetch error:', error)
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('usage limit exceeded')) {
          throw new Error('API rate limit exceeded. Please try again later.')
        }
        if (error.message.includes('403')) {
          throw new Error('API access forbidden. Service temporarily unavailable.')
        }
        if (error.message.includes('401')) {
          throw new Error('API authentication failed. Service temporarily unavailable.')
        }
      }
      
      throw new Error('Failed to fetch data from RAWG API')
    }
  }

  async fetchYouTube(query: string, maxResults: number = 5): Promise<unknown> {
    if (!this.youtubeApiKey) {
      console.warn('YouTube API key not configured')
      return { items: [] }
    }

    const url = new URL('https://www.googleapis.com/youtube/v3/search')
    url.searchParams.set('part', 'snippet')
    url.searchParams.set('q', query)
    url.searchParams.set('type', 'video')
    url.searchParams.set('maxResults', maxResults.toString())
    url.searchParams.set('key', this.youtubeApiKey)

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'Accept': 'application/json',
        },
        next: { revalidate: 3600 } // 1 hour cache
      })

      if (!response.ok) {
        throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('YouTube API fetch error:', error)
      return { items: [] } // Return empty results instead of throwing
    }
  }

  // Sanitize and validate input
  sanitizeSearchQuery(query: string): string {
    return query
      .trim()
      .replace(/[<>\"'&]/g, '') // Remove potentially harmful characters
      .substring(0, 100) // Limit length
  }

  // Enhanced search query processing for better results
  enhanceSearchQuery(query: string): string {
    if (!query || typeof query !== 'string') return ''
    
    // Basic sanitization first - preserve original case for better matching
    const processed = this.sanitizeSearchQuery(query)
    
    // Handle specific game series with special abbreviation patterns (case insensitive)
    const specificGamePatterns: Record<string, RegExp> = {
      'EA SPORTS FC': /\b(ea\s*fc|ea\s*sports?\s*fc|eafc)\b/gi,
      'FIFA': /\b(fifa)\b/gi,
      'Call of Duty': /\b(cod|call\s*of\s*duty)\b/gi,
      'Grand Theft Auto': /\b(gta|grand\s*theft\s*auto)\b/gi,
      'Counter Strike': /\b(cs|csgo|counter\s*strike)\b/gi,
      'Assassins Creed': /\b(ac|assassins?\s*creed)\b/gi,
      'Battlefield': /\b(bf|battlefield)\b/gi,
      'Need for Speed': /\b(nfs|need\s*for\s*speed)\b/gi,
      'Red Dead Redemption': /\b(rdr|red\s*dead\s*redemption)\b/gi,
      'God of War': /\b(gow|god\s*of\s*war)\b/gi,
      'The Last of Us': /\b(tlou|last\s*of\s*us)\b/gi,
      'League of Legends': /\b(lol|league\s*of\s*legends)\b/gi,
      'World of Warcraft': /\b(wow|world\s*of\s*warcraft)\b/gi,
      'Defense of the Ancients': /\b(dota)\b/gi,
      'PlayerUnknowns Battlegrounds': /\b(pubg|playerunknowns?\s*battlegrounds?)\b/gi,
      'Far Cry': /\b(fc(?!\s*\d+$)|far\s*cry)\b/gi, // FC only if not followed by just numbers
    }
    
    let result = processed
    
    // Apply specific game pattern matching
    for (const [gameName, pattern] of Object.entries(specificGamePatterns)) {
      if (pattern.test(result)) {
        result = result.replace(pattern, gameName)
        break // Only apply first match to avoid conflicts
      }
    }
    
    // Handle year variations - be more flexible with years
    // Remove specific years and let search be more flexible, but keep them for ranking
    result = result.replace(/\b(20\d{2}|'\d{2})\b/g, '').trim()
    
    // Clean up multiple spaces
    result = result.replace(/\s+/g, ' ').trim()
    
    // Remove common noise words that don't help with game search, but preserve important ones
    const noiseWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'with', 'by']
    const words = result.toLowerCase().split(/\s+/).filter(word => 
      word.length > 1 && !noiseWords.includes(word)
    )
    
    // Handle additional common gaming terms and abbreviations
    const gameTermMappings: Record<string, string> = {
      'cod': 'call of duty',
      'gta': 'grand theft auto',
      'lol': 'league of legends',
      'wow': 'world of warcraft',
      'cs': 'counter strike',
      'csgo': 'counter strike global offensive',
      'dota': 'defense of the ancients',
      'pubg': 'playerunknown battlegrounds',
      'rdr': 'red dead redemption',
      'gow': 'god of war',
      'ac': 'assassins creed',
      'bf': 'battlefield',
      'nfs': 'need for speed',
      'tlou': 'the last of us'
    }
    
    // Expand any remaining abbreviations
    const expandedWords = words.map(word => {
      const mapping = gameTermMappings[word.toLowerCase()]
      return mapping || word
    })
    
    // Join back and handle special cases
    result = expandedWords.join(' ').trim()
    
    // Handle roman numerals (common in game titles)
    result = result.replace(/\b(\w+)\s+(i{1,3}|iv|v|vi{1,3}|ix|x)\b/gi, '$1 $2')
    
    // Handle common game suffixes - remove them for broader search
    result = result.replace(/\b(edition|remastered|deluxe|ultimate|gold|premium|complete|goty|standard)\b/gi, '').trim()
    
    // Clean up any double spaces again
    result = result.replace(/\s+/g, ' ').trim()
    
    // Store original year for later use in ranking if needed
    // Note: We'll pass the original year through the search context instead
    
    return result.substring(0, 80) // Reasonable length limit
  }

  // Create multiple search variants for better matching when filters are applied
  createSearchVariants(query: string, hasFilters: boolean = false): string[] {
    const variants: string[] = []
    const enhanced = this.enhanceSearchQuery(query)
    
    // Always include the enhanced query
    if (enhanced) {
      variants.push(enhanced)
    }
    
    // If we have filters, create broader variants for better matching
    if (hasFilters) {
      // Original query (sanitized but not enhanced)
      const sanitized = this.sanitizeSearchQuery(query).toLowerCase()
      if (sanitized && sanitized !== enhanced) {
        variants.push(sanitized)
      }
      
      // Individual important words (for multi-word queries)
      if (enhanced.includes(' ')) {
        const words = enhanced.split(' ').filter(word => word.length > 2)
        // Add the most important words (usually first and last)
        if (words.length >= 2) {
          variants.push(words[0]) // First word
          if (words.length > 2) {
            variants.push(words[words.length - 1]) // Last word
          }
        }
      }
      
      // Remove year for broader search when filters are applied
      const withoutYear = enhanced.replace(/\b(20\d{2}|'\d{2}|\d{2})\b/g, '').replace(/\s+/g, ' ').trim()
      if (withoutYear && withoutYear !== enhanced) {
        variants.push(withoutYear)
      }
    }
    
    // Remove duplicates and empty strings
    return Array.from(new Set(variants.filter(v => v.length > 0)))
  }

  // Intelligent ranking of search results
  rankSearchResults(results: unknown[], originalQuery: string): unknown[] {
    if (!results || !Array.isArray(results) || !originalQuery) {
      return results
    }

    const queryLower = originalQuery.toLowerCase()
    const queryWords = queryLower.split(/\s+/).filter(word => word.length > 1)

    return results
      .map(game => {
        const gameRecord = game as Record<string, unknown>
        let score = 0
        const gameName = (gameRecord.name as string || '').toLowerCase()
        
        // Enhanced pattern matching for game series and abbreviations
        const enhancedMatches = this.getGameMatchScore(gameName, queryLower, originalQuery)
        score += enhancedMatches
        
        // Exact match bonus
        if (gameName === queryLower) {
          score += 1000
        }
        
        // Starts with query bonus
        if (gameName.startsWith(queryLower)) {
          score += 500
        }
        
        // Contains full query bonus
        if (gameName.includes(queryLower)) {
          score += 200
        }
        
        // Individual word matches
        queryWords.forEach(word => {
          if (gameName.includes(word)) {
            score += 50
          }
          if (gameName.startsWith(word)) {
            score += 25
          }
        })
        
        // Popularity boost (rating and rating count)
        if (gameRecord.rating) {
          score += Math.min((gameRecord.rating as number) * 10, 50)
        }
        if (gameRecord.ratings_count) {
          score += Math.min(Math.log10(gameRecord.ratings_count as number), 20)
        }
        
        // Release date relevance (newer games get slight boost)
        if (gameRecord.released) {
          const releaseYear = new Date(gameRecord.released as string).getFullYear()
          const currentYear = new Date().getFullYear()
          const yearDiff = currentYear - releaseYear
          if (yearDiff <= 5) {
            score += 10 - (yearDiff * 2)
          }
        }
        
        return { ...gameRecord, _searchScore: score }
      })
      .sort((a, b) => ((b as Record<string, unknown>)._searchScore as number || 0) - ((a as Record<string, unknown>)._searchScore as number || 0))
      .map(game => {
        // Remove the temporary score property
        const gameRecord = game as Record<string, unknown>
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { _searchScore: _, ...cleanGame } = gameRecord
        return cleanGame
      })
  }

  // Enhanced game matching logic for better series and abbreviation recognition
  private getGameMatchScore(gameName: string, queryLower: string, originalQuery: string): number {
    let score = 0
    
    // Convert all to lowercase for case-insensitive comparison
    const gameNameLower = gameName.toLowerCase()
    const originalQueryLower = originalQuery.toLowerCase()
    
    // Define series patterns that should match even with abbreviations
    const seriesPatterns = [
      // EA Sports patterns
      {
        query: /\b(ea\s*fc|ea\s*sports?\s*fc|eafc)\b/gi,
        gamePattern: /\bea\s*sports?\s*fc\b/gi,
        score: 900
      },
      {
        query: /\b(fifa)\b/gi,
        gamePattern: /\bfifa\b/gi,
        score: 900
      },
      // Call of Duty patterns
      {
        query: /\b(cod|call\s*of\s*duty)\b/gi,
        gamePattern: /\bcall\s*of\s*duty\b/gi,
        score: 900
      },
      // Grand Theft Auto patterns
      {
        query: /\b(gta|grand\s*theft\s*auto)\b/gi,
        gamePattern: /\bgrand\s*theft\s*auto\b/gi,
        score: 900
      },
      // Assassins Creed patterns
      {
        query: /\b(ac|assassins?\s*creed)\b/gi,
        gamePattern: /\bassassins?\s*creed\b/gi,
        score: 900
      },
      // Counter Strike patterns
      {
        query: /\b(cs|csgo|counter\s*strike)\b/gi,
        gamePattern: /\bcounter.*strike\b/gi,
        score: 900
      },
      // Battlefield patterns
      {
        query: /\b(bf|battlefield)\b/gi,
        gamePattern: /\bbattlefield\b/gi,
        score: 900
      },
      // Need for Speed patterns
      {
        query: /\b(nfs|need\s*for\s*speed)\b/gi,
        gamePattern: /\bneed\s*for\s*speed\b/gi,
        score: 900
      }
    ]
    
    // Check for series matches
    for (const pattern of seriesPatterns) {
      if (pattern.query.test(originalQueryLower) && pattern.gamePattern.test(gameNameLower)) {
        score += pattern.score
        
        // Additional bonus for more recent versions if year is mentioned
        const yearMatch = originalQueryLower.match(/\b(20\d{2}|'\d{2}|2[0-9])\b/)
        if (yearMatch) {
          const queryYear = yearMatch[0]
          // Check if game name contains the year or close to it
          if (gameNameLower.includes(queryYear)) {
            score += 300
          } else {
            // Check for year variations (2024 -> 24, 2025 -> 25, etc.)
            const shortYear = queryYear.length === 4 ? queryYear.slice(-2) : queryYear
            const longYear = queryYear.length === 2 ? '20' + queryYear : queryYear
            if (gameNameLower.includes(shortYear) || gameNameLower.includes(longYear)) {
              score += 200
            }
          }
        } else {
          // Bonus for latest versions when no specific year is mentioned
          const currentYear = new Date().getFullYear()
          for (let year = currentYear; year >= currentYear - 3; year--) {
            if (gameNameLower.includes(year.toString()) || gameNameLower.includes(year.toString().slice(-2))) {
              score += 150 - ((currentYear - year) * 30)
              break
            }
          }
        }
        
        break // Only apply first matching pattern
      }
    }
    
    // Handle numeric sequences (like FC 25, FIFA 24, etc.)
    const gameNumbers: string[] = gameNameLower.match(/\b(\d{2,4})\b/g) || []
    const queryNumbers: string[] = originalQueryLower.match(/\b(\d{2,4})\b/g) || []
    
    if (gameNumbers.length > 0 && queryNumbers.length > 0) {
      // Exact number match
      const exactMatch = gameNumbers.some((gNum: string) => queryNumbers.includes(gNum))
      if (exactMatch) {
        score += 400
      } else {
        // Close number match (within 2 years for sports games)
        const closeMatch = gameNumbers.some((gNum: string) => 
          queryNumbers.some((qNum: string) => Math.abs(parseInt(gNum) - parseInt(qNum)) <= 2)
        )
        if (closeMatch) {
          score += 200
        }
      }
    }
    
    // Handle year variations (2024 -> 24, etc.)
    const queryYearLong = originalQueryLower.match(/\b20(\d{2})\b/)
    const gameYearShort = gameNameLower.match(/\b(\d{2})\b/)
    if (queryYearLong && gameYearShort && queryYearLong[1] === gameYearShort[1]) {
      score += 300
    }
    
    // Case-insensitive exact matches
    if (gameNameLower === queryLower || gameNameLower === originalQueryLower) {
      score += 1000
    }
    
    // Case-insensitive partial matches
    if (gameNameLower.includes(queryLower)) {
      score += 150
    }
    if (gameNameLower.includes(originalQueryLower)) {
      score += 100
    }
    
    return score
  }

  validateGameId(id: string): boolean {
    return /^\d+$/.test(id) && parseInt(id) > 0
  }
}

// Export singleton instance
export const secureApiClient = SecureAPIClient.getInstance()
