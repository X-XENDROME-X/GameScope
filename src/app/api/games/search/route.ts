import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract and validate parameters
    const rawQuery = searchParams.get('search') || ''
    const page = Math.max(1, Math.min(100, parseInt(searchParams.get('page') || '1')))
    const pageSize = Math.max(1, Math.min(40, parseInt(searchParams.get('page_size') || '20')))
    const platforms = searchParams.get('platforms')
    const genres = searchParams.get('genres') 
    const ordering = searchParams.get('ordering')

    // Enhanced query processing for better search results
    const processedQuery = secureApiClient.enhanceSearchQuery(rawQuery)
    const hasFilters = !!(platforms || genres || ordering)
    
    // If no meaningful query after processing, return trending games
    if (!processedQuery || processedQuery.length < 1) {
      const trendingParams: Record<string, string | number> = {
        ordering: '-rating,-released',
        page,
        page_size: pageSize
      }
      
      if (platforms) trendingParams.platforms = platforms
      if (genres) trendingParams.genres = genres

      const data = await secureApiClient.fetchRAWG('games', trendingParams)
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        }
      })
    }

    // Create multiple search variants for better matching, especially with filters
    const searchVariants = secureApiClient.createSearchVariants(rawQuery, hasFilters)
    
    // Multiple search strategies for better results
    const searchStrategies = searchVariants.map(variant => ({ search: variant }))

    // Try each search strategy until we get good results
    let bestResults: Record<string, unknown> | null = null
    let highestResultCount = 0
    const allResults: unknown[] = []
    const seenGameIds = new Set<string>()

    // When filters are applied, try more strategies for better coverage
    const strategiesToTry = hasFilters ? Math.min(searchStrategies.length, 4) : Math.min(searchStrategies.length, 3)

    for (let i = 0; i < strategiesToTry; i++) {
      const strategy = searchStrategies[i]
      if (!strategy) continue
      
      const params: Record<string, string | number> = {
        ...strategy,
        page: 1, // Always get first page for comparison
        page_size: hasFilters ? 40 : Math.min(pageSize * 2, 40) // Get more results when filters are applied
      }

      if (platforms) params.platforms = platforms
      if (genres) params.genres = genres
      if (ordering && !hasFilters) params.ordering = ordering // Apply ordering only if no other filters for better ranking

      try {
        const data = await secureApiClient.fetchRAWG('games', params) as Record<string, unknown>
        const results = (data?.results as unknown[]) || []
        
        // Collect all unique results for better ranking
        if (results.length > 0) {
          results.forEach(game => {
            const gameRecord = game as Record<string, unknown>
            const gameId = String(gameRecord.id || '')
            if (!seenGameIds.has(gameId)) {
              seenGameIds.add(gameId)
              allResults.push(game)
            }
          })
        }
        
        if (results.length > highestResultCount) {
          highestResultCount = results.length
          bestResults = data
        }

        // Continue collecting even if we got good results for comprehensive ranking
      } catch (error) {
        console.warn('Search strategy failed:', strategy, error)
        continue
      }
    }

    // If no strategies worked well, fallback to basic search
    if (!bestResults || (highestResultCount === 0 && allResults.length === 0)) {
      const fallbackParams: Record<string, string | number> = {
        search: secureApiClient.sanitizeSearchQuery(rawQuery),
        page,
        page_size: pageSize
      }

      if (platforms) fallbackParams.platforms = platforms
      if (genres) fallbackParams.genres = genres
      if (ordering) fallbackParams.ordering = ordering

      bestResults = await secureApiClient.fetchRAWG('games', fallbackParams) as Record<string, unknown>
    }

    // Use combined results if we collected any, otherwise use best single result
    const resultsToRank = allResults.length > 0 ? allResults : (bestResults?.results as unknown[]) || []

    // Apply intelligent result filtering and ranking
    if (resultsToRank.length > 0) {
      const rankedResults = secureApiClient.rankSearchResults(resultsToRank, rawQuery) // Use original query for ranking
      
      // Paginate the ranked results
      const startIndex = (page - 1) * pageSize
      const endIndex = startIndex + pageSize
      const paginatedResults = rankedResults.slice(startIndex, endIndex)
      
      // Create response structure
      const response = {
        count: rankedResults.length,
        next: paginatedResults.length === pageSize ? `?page=${page + 1}` : null,
        previous: page > 1 ? `?page=${page - 1}` : null,
        results: paginatedResults
      }
      
      return NextResponse.json(response, {
        headers: {
          'Cache-Control': 'public, max-age=180, stale-while-revalidate=360', // Shorter cache for search
          'X-Search-Query': processedQuery,
          'X-Search-Strategy': 'enhanced',
          'X-Results-Found': rankedResults.length.toString()
        }
      })
    }
    
    // Return enhanced search results
    return NextResponse.json(bestResults || { results: [], count: 0 }, {
      headers: {
        'Cache-Control': 'public, max-age=180, stale-while-revalidate=360', // Shorter cache for search
        'X-Search-Query': processedQuery,
        'X-Search-Strategy': 'fallback'
      }
    })
    
  } catch (error) {
    console.error('Games search API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to search games', 
        code: 'SEARCH_FAILED' 
      },
      { status: 500 }
    )
  }
}

// Export with security middleware
export const GET = withSecurity(handler)
