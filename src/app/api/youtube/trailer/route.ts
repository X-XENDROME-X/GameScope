import { NextRequest, NextResponse } from 'next/server'
import { withSecurity } from '@/lib/server/security'
import { secureApiClient } from '@/lib/server/api-client'

async function handler(request: NextRequest): Promise<NextResponse> {
  try {
    const { searchParams } = new URL(request.url)
    
    // Extract and validate parameters
    const gameName = secureApiClient.sanitizeSearchQuery(searchParams.get('game') || '')
    const maxResults = Math.min(10, Math.max(1, parseInt(searchParams.get('max_results') || '3')))

    if (!gameName) {
      return NextResponse.json(
        { error: 'Game name is required', code: 'MISSING_GAME_NAME' },
        { status: 400 }
      )
    }

    // Create optimized search query for trailers
    const searchQuery = `${gameName} game trailer gameplay`
    
    // Fetch from YouTube API securely
    const youtubeData = await secureApiClient.fetchYouTube(searchQuery, maxResults)
    
    // Return sanitized response
    return NextResponse.json(youtubeData, {
      headers: {
        'Cache-Control': 'public, max-age=1800, stale-while-revalidate=3600' // 30min cache
      }
    })
    
  } catch (error) {
    console.error('YouTube trailer API error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch trailers', 
        code: 'TRAILER_FETCH_FAILED',
        items: [] // Return empty array as fallback
      },
      { status: 500 }
    )
  }
}

// Export with security middleware
export const GET = withSecurity(handler)
